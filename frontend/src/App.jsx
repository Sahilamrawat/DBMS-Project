import { useState } from 'react'
import {Route, Routes, BrowserRouter} from 'react-router-dom'
import Navheader from './Components/Navheader'


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>

  )
}

export default App


function Home() {
  return (
    <div className='w-[100vw] h-[100vh] bg-white'>
      <Navheader />
      
        Home
      
    </div>
  )
}