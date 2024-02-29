import React, { useState, useContext, useEffect } from 'react';
import {
  MdClose,
  MdMenu,
  MdAdd,
  MdOutlineVpnKey,
  MdPanoramaFishEye,
  MdWidthFull,
} from 'react-icons/md';
import { AiOutlineGithub } from 'react-icons/ai';
import { ChatContext } from '../context/chatContext';
import bot from '../assets/uic.png';
import { max } from 'moment';
import { useNavigate } from "react-router-dom";


/*
  Sidebar Component
  - Renders a list of navigation items.
  - Includes a toggle for light/dark mode.

  Props:
  - props (Object): Properties for the component's configuration.
*/

const SideBar = () => {
  const [open, setOpen] = useState(true);
  const [, , clearMessages] = useContext(ChatContext);
  const [modalOpen, setModalOpen] = useState(false);

  function handleResize() {
    window.innerWidth <= 720 ? setOpen(false) : setOpen(true);
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const clearChat = () => clearMessages();
  const navigate = useNavigate();

  const navigateToText = () => {
    clearMessages();
    navigate('/text'); // Programmatically navigate to /text
  };

  const navigateToTextGesture = () => {
    clearMessages();
    navigate('/text_gesture'); // Programmatically navigate to /text_gesture
  };

  return (
    <section className={` ${open ? 'w-64' : 'w-16'} sidebar`}>
      <div className='sidebar__app-bar'>
        <div className={`sidebar__app-logo ${!open && 'scale-0 hidden'}`}>
          <span className='w-6 h-6'>
            <img style={{width: "100%", marginRight: 0}} src={bot} alt='' />
            {/* <MdPanoramaFishEye /> */}
          </span>
        </div>
    <h1 className={`sidebar__app-title ${!open && 'scale-0 hidden'}`}>
          ELICIT
        </h1>    
        <div className={`sidebar__btn-close`} onClick={() => setOpen(!open)}>
          {open ? (
            <MdClose className='sidebar__btn-icon' />
          ) : (
            <MdMenu className='sidebar__btn-icon' />
          )}
        </div>
      </div>
      <div className='nav'>
        <span
          className='border nav__item border-neutral-600'
          onClick={navigateToText}>
          <div className='nav__icons'>
            <MdMenu />
          </div>
          <h1 className={`${!open && 'hidden'}`}>Text Only</h1>
        </span>
      </div>
      <div className='nav'>
        <span
          className='border nav__item border-neutral-600'
          onClick={navigateToTextGesture}>
          <div className='nav__icons'>
            <MdMenu />
          </div>
          <h1 className={`${!open && 'hidden'}`}>Text with Gesture</h1>
        </span>
      </div>



    </section>
  );
};

export default SideBar;
