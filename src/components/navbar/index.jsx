import MessengerIcon from './icons/redirect.svg'
import React, { useState, useEffect, useRef } from 'react'
import { CSSTransition } from 'react-transition-group'
import Link from 'next/link'

function NavigationBar({ Data }) {
   return (
      <>
         <Navbar>
            {Data.map((menu, index) => {
               return (
                  <>
                     {menu.parentNavigationMenuItemId == null && (
                        <NavItem key={index} menu={menu}>
                           {menu.childNodes.length > 0 && (
                              <DropdownMenu
                                 childMenu={menu}
                                 Data={Data}
                              ></DropdownMenu>
                           )}
                        </NavItem>
                     )}
                  </>
               )
            })}
         </Navbar>
      </>
   )
}

function Navbar(props) {
   return (
      <nav className="navbar">
         <ul
            className="navbar-nav ul-class"
            style={{ flexDirection: 'row', width: '100%' }}
         >
            {props.children}
         </ul>
      </nav>
   )
}

function NavItem({ children, menu }) {
   const [open, setOpen] = useState(false)

   return (
      <li className="nav-item">
         {menu.childNodes.length > 0 ? (
            <span className="span-class" onClick={() => setOpen(!open)}>
               {menu.label}
            </span>
         ) : (
            <Link href={menu.url} className="icon-button link-class">
               {menu.label}
            </Link>
         )}

         {open && children}
      </li>
   )
}

function DropdownMenu({ childMenu, Data }) {
   const [activeMenu, setActiveMenu] = useState(childMenu.label)
   const [lastRender, setLastRender] = useState([childMenu.label])
   const [menuHeight, setMenuHeight] = useState(null)
   const dropdownRef = useRef(null)

   useEffect(() => {
      console.log('hello', dropdownRef?.current?.firstChild)
      setMenuHeight(dropdownRef?.current?.firstChild?.offsetHeight + 25)
   }, [])

   function calcHeight(el) {
      const height = el.offsetHeight
      setMenuHeight(height)
   }

   function DropdownItem({ children, childMenu, goToMenu }) {
      return (
         <>
            <div>
               <div
                  style={{
                     display: 'flex',
                     flexDirection: 'row',
                     justifyContent: 'space-between',
                     cursor: 'default !important',
                     alignItems: 'center',
                  }}
               >
                  {childMenu &&
                  childMenu.childNodes &&
                  childMenu.childNodes.length > 0 ? (
                     <div
                        style={{ color: '#dadce1', width: '80%' }}
                        className="menu-item"
                        onClick={() => {
                           setLastRender(prevState => [...prevState, goToMenu])
                           return goToMenu && setActiveMenu(goToMenu)
                        }}
                     >
                        <span
                           className="span-class"
                           style={{ cursor: 'pointer' }}
                        >
                           {children}{' '}
                        </span>
                     </div>
                  ) : (
                     <span
                        style={{ color: '#dadce1', width: '80%' }}
                        className="menu-item link-class"
                     >
                        <Link href={childMenu.url}>{children}</Link>
                     </span>
                  )}

                  <div style={{ width: '20%' }} className="menu-item">
                     <Link
                        href={childMenu.url}
                        className="menu-item link-class"
                     >
                        <MessengerIcon />
                     </Link>
                  </div>
               </div>
            </div>
         </>
      )
   }
   console.log('active menu', activeMenu)

   return (
      <div
         className="nav-dropdown"
         style={{ height: menuHeight }}
         ref={dropdownRef}
      >
         {Data.map((menu, index) => {
            return (
               <>
                  <CSSTransition
                     in={lastRender[lastRender.length - 1] === menu.label}
                     timeout={500}
                     classNames="menu-primary"
                     unmountOnExit
                     key={index}
                     onEnter={calcHeight}
                  >
                     <div className="menu">
                        <div
                           style={{
                              display: 'flex',
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              cursor: 'default !important',
                              alignItems: 'center',
                           }}
                        >
                           <div
                              style={{ color: '#dadce1', width: '80%' }}
                              className="menu-item"
                           >
                              <h2
                                 onClick={() => {
                                    console.log('hello world')
                                    if (lastRender.length > 1) {
                                       const newRen = [...lastRender]
                                       newRen.pop()
                                       setLastRender(newRen)
                                       return
                                    }
                                 }}
                              >
                                 {menu.label}
                              </h2>
                           </div>
                           <div style={{ width: '20%' }} className="menu-item">
                              <Link
                                 href={menu.url}
                                 className="menu-item link-class"
                              >
                                 <MessengerIcon />
                              </Link>
                           </div>
                        </div>
                        {menu.childNodes.map((childMenu, index) => {
                           return (
                              <DropdownItem
                                 childMenu={childMenu}
                                 key={index}
                                 goToMenu={childMenu.label}
                              >
                                 {childMenu.label}
                              </DropdownItem>
                           )
                        })}
                     </div>
                  </CSSTransition>
               </>
            )
         })}
      </div>
   )
}

export default NavigationBar
