import React from 'react'
import '../index.css'
function Navheader() {
  return (
    <div className='Nav-Container bg-white min-h-[7%] flex items-center '>
        <nav className='flex justify-between w-[100%] '>
          <div className='flex items-center w-[50%]'>
            <div className='ml-5'>
              <a href='/' className='text-2xl font-bold'>Logo</a>
            </div>
             <ul className='flex items-center ml-5 justify-around w-[30%] '>
                <li className='li-items hover:text-[#77B254] cursor-pointer hover:scale-110 duration-150'>Home</li>
                <li className='li-items hover:text-[#77B254] cursor-pointer hover:scale-110 duration-150'>Book</li>
                <li className='li-items hover:text-[#77B254] cursor-pointer hover:scale-110 duration-150'>About Us</li>
             </ul>
          </div>
          <div className='flex items-center'>
          <div className='mr-1'>
              <button className='SignUp rounded-full px-3 py-1  cursor-pointer hover:scale-110 duration-150'>Sign-Up</button>
            </div>
            <div className='mr-7'>
              <button className='Login bg-[#77B254] rounded-full px-3 py-1 cursor-pointer text-white hover:scale-110 duration-150'>Login</button>
            </div>
            
          </div>

        </nav>
    </div>
  )
}

export default Navheader