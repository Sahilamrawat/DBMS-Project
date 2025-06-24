import os
import django
import socketio
import openai
from pymongo import MongoClient
import jwt
from asgiref.sync import sync_to_async

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.conf import settings
from django.contrib.auth import get_user_model

# Setup MongoDB
mongo_client = MongoClient(settings.MONGODB_URI)
mongo_db = mongo_client[settings.MONGODB_DB_NAME]
chat_collection = mongo_db['chats']

# Setup OpenAI
client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'),)

# Setup Socket.IO server
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = socketio.ASGIApp(sio)

User = get_user_model()

async def get_user_from_token(token):
    try:
        print("Received token:", token)
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        print("Decoded payload:", payload)
        user_id = payload.get('user_id')
        user = await sync_to_async(User.objects.get)(id=user_id)
        print("Authenticated user:", user.username)
        return user
    except Exception as e:
        print("JWT decode error:", e)
        return None

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def chat_message(sid, data):
    # data: {token: "...", message: "..."}
    token = data.get('token')
    message = data.get('message')
    user = await get_user_from_token(token)
    if not user:
        await sio.emit('chat_response', {'error': 'Authentication failed.'}, to=sid)
        return

    # Call OpenAI
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": message}]
        )
        ai_response = response.choices[0].message.content
    except Exception as e:
        await sio.emit('chat_response', {'error': str(e)}, to=sid)
        return

    # Store chat in MongoDB
    chat_collection.insert_one({
        'user_id': str(user.id),
        'username': user.username,
        'message': message,
        'ai_response': ai_response
    })

    # Send response back to client
    await sio.emit('chat_response', {'response': ai_response}, to=sid)
