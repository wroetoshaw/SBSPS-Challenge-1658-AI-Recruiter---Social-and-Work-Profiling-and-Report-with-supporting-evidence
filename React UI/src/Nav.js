import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link, useRouteMatch } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import Home from './Home.js';
import ListPositionResponse from './ListResponses';
import About from './About.js';
import './Nav.css';

export default function SidebarExample() {
	return (
		<Router>
			<body>
				<nav className="navbar">
					<ul className="navbar-nav">
						<li className="nav-item">
							<Link className="nav-link">
								<i class="fas fa-users fa-fw fa-2x" />
								<span className="link-text">Ai Recruiter</span>
							</Link>
						</li>
						<li className="nav-item">
							<Link to="/home" className="nav-link">
								<i class="fas fa-home fa-fw fa-2x" />
								<span className="link-text">Home</span>
							</Link>
						</li>
						<li className="nav-item">
							<Link to="/about" className="nav-link">
								<i class="fas fa-project-diagram fa-fw fa-2x" />
								<span className="link-text">About </span>
							</Link>
						</li>
						<li className="nav-item">
							<Link to="/Logout" className="nav-link">
								<i class="fa fa-sign-out fa-fw fa-2x" />
								<span className="link-text">Logout</span>
							</Link>
						</li>
						<li />
					</ul>
				</nav>
				<main className="main">
					<div className="header">
						<div className="inner-header">
							<div className="logo_container">
								<h1>
									AI <span>Recruiter</span>
								</h1>
							</div>

							<ul className="header-navigation">
								<a>
									<li>
										<div className="admin-button">
											<span>
												<Button type="variant">Admin</Button>
											</span>
											<i class="fas fa-user-circle fa-fw fa-3x" />
										</div>
									</li>
								</a>
							</ul>
						</div>
					</div>

					<Switch>
						<Route path="/" component={Home} exact />
						<Route path="/home" component={Home} exact />
						<Route path="/about" component={About} exact />
						<Route path="/Logout" component={Test} />
						<Route path="/home/viewresponses/:jobtitle" component={ListPositionResponse} exact />
					</Switch>
				</main>
			</body>
		</Router>
	);
}

const Test = () => {
	let { url } = useRouteMatch();
	console.log(`${url}/topic1`);

	return (
		<div>
			<h1 style={{ textAlign: 'left', marginTop: '10rem', marginLeft: '40rem' }}>Logout</h1>
			{/* <ul>
				<li>
					<Link to={`${url}/topic1`}>topic1</Link>
				</li>
			</ul>
			<Switch>
				<Route path={`${path}/topic1`} component={AnotherTest} exact />
			</Switch> */}
		</div>
	);
};

// const AnotherTest = () => {
// 	console.log('clicked');

// 	return (
// 		<div>
// 			<h2>testing</h2>
// 			<h2>testing</h2>
// 			<h2>testing</h2>
// 			<h2>testing</h2>
// 		</div>
// 	);
// };

// import GenerateDashbaord from './GenerateDashboard.js';
/* <Route
path="/home/viewresponses/:jobtitle/:applicationid"
component={GenerateDashbaord}
exact/> */
