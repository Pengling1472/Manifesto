import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
import React from 'react'

/*
PAGES
*/

import Home from './page/Home'
import DesignIsMotion from './page/DesignIsMotion'

/* 
STYLES
*/

import './index.css'

/*
PAGE SETUP
*/

ReactDOM.createRoot( document.getElementById( 'root' )! ).render(
	<>
		<React.StrictMode>
			<BrowserRouter>
				<Routes>
					<Route path="/design-is-motion" element={ <DesignIsMotion/> }/>
					<Route path="*" element={ <Home/> }/>
				</Routes>
			</BrowserRouter>
		</React.StrictMode>
	</>
)
