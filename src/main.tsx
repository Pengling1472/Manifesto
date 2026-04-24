import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
import React from 'react'

/*
PAGES
*/

import Home from './page/Home'

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
					<Route path="/" element={ <Home/> }/>
					{/* <Route path="*" element={ <NotFound/> }/> */}
				</Routes>
			</BrowserRouter>
		</React.StrictMode>
	</>
)
