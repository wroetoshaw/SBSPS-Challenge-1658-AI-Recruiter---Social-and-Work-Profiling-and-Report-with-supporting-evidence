import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Nav from './Nav';
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';

import * as serviceWorker from './serviceWorker';

ReactDOM.render(
	<React.StrictMode>
		<Nav />
	</React.StrictMode>,
	document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
