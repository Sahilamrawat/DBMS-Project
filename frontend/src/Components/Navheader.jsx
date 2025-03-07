import React from 'react'
import '../index.css'
function Navheader() {
  return (
    <div className='Nav-Container bg-white min-h-[7%] flex items-center m-auto pt-3 pb-2'>
        <nav className='flex justify-between items-center w-[100%] '>
          <div className='flex items-center ml-10'>
            <a href='/' className='text-[35px] font-bold'>Logo</a>         
          </div>
          <div className=''>
            <ul className='flex items-center  justify-between space-x-10 text-[20px] ml-20'>
                <li className='li-items hover:text-[#77B254] cursor-pointer hover:scale-110 duration-150'>Home</li>
                <li className='li-items hover:text-[#77B254] cursor-pointer hover:scale-110 duration-150'>Book</li>
                <li className='li-items hover:text-[#77B254] cursor-pointer hover:scale-110 duration-150'>About Us</li>
            </ul>
          </div>
          <div className='flex items-center text-[17px] space-x-1 mr-10'>
            <div className=''>
              <button className='SignUp rounded-full px-3 py-1  cursor-pointer hover:scale-110 duration-150'>Sign-Up</button>
            </div>
            <div className=''>
              <button className='Login bg-[#77B254] rounded-full px-3 py-1 cursor-pointer text-white hover:scale-110 duration-150'>Login</button>
            </div>
            
          </div>

        </nav>
    </div>
  )
}

export default Navheader