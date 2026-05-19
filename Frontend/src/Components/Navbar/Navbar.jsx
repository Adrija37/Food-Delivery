import { useContext, useState } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext'
const Navbar = ({ setshowLogin }) => {
  const [menu, setmenu] = useState("Home")
  const { getTotalCartAmount, token, setToken,setCartItems } = useContext(StoreContext)
  
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("cartItems");
    setToken("");
    setCartItems({});
    navigate("/", { replace: true });

    window.location.reload();
  }
  
  return (
    <div className='navbar'>
      <Link to='/' ><img src={assets.logo} alt="" className="logo" /></Link>
      <ul className="navbar-menu">
        <Link to='/' onClick={() => setmenu("Home")} className={menu === "Home" ? "active" : ""}>Home</Link>
        <a href='#explore-menu' onClick={() => setmenu("Menu")} className={menu === "Menu" ? "active" : ""}>Menu</a>
        <a href='#app-download' onClick={() => setmenu("Mobile_app")} className={menu === "Mobile_app" ? "active" : ""}>Mobile_app</a>
        <a href='#footer' onClick={() => setmenu("Contact us")} className={menu === "Contact us" ? "active" : ""}>Contact us</a>
      </ul>
      <div className="navbar-right">
        <img src={assets.search_icon} alt="" />
        <div className="navbar-search-icon">

          <Link to='/cart'>
            <img src={assets.basket_icon} alt="" />
          </Link>

          <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>

        </div>
        {
          !token
            ? <button onClick={() => setshowLogin(true)}>sign in</button>
            : <div className='navbar-profile'>

              <img src={assets.profile_icon} alt="" />

              <ul className="nav-profile-dropdown">

                <li onClick={()=> navigate('/myorders')}>
                  <img src={assets.bag_icon} alt="" />
                  <p>Orders</p>
                </li>

                <hr />

                <li onClick={logout}>
                  <img src={assets.logout_icon} alt="" />
                  <p>Logout</p>
                </li>

              </ul>

            </div>
        }
      </div>
    </div>
  )
}

export default Navbar
