import React from 'react'
import Sidebar from '../components/Sidebar'
import Chat from '../components/Chat'
import Background from "../img/background.png";

const Home = () => {
  return (
    <div style={{ backgroundImage: `url(${Background})`,
    backgroundRepeat : "no-repeat",
    backgroundSize : "cover"
    }}>
    <div className='home'>
      <div className="container">
        <Sidebar/>
        <Chat/>
      </div>
    </div>
    </div> 
  )
}

export default Home