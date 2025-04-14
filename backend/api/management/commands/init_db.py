from django.core.management.base import BaseCommand
from api.models import initialize_database

class Command(BaseCommand):
    help = 'Initialize the database with required tables'

    def handle(self, *args, **options):
        try:
            self.stdout.write('Initializing database...')
            initialize_database()
            self.stdout.write(self.style.SUCCESS('Database initialized successfully!'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error initializing database: {str(e)}'))