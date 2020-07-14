import React from 'react';
import { Card } from 'react-bootstrap';

const About = () => {
	return (
		<div className="App">
			<Card className="job-card">
				<Card.Header className="job-card-header">
					<div>
						<span>
							<h2 className="job-title" style={{ textAlign: 'center' }}>
								About
							</h2>
						</span>
					</div>
				</Card.Header>
				<Card.Body className="card-body">
					<div>
						<p style={{ color: 'black', fontWeight: 'bold' }}>Project:</p>
						<li style={{ listStyleType: 'none', padding: '0.5rem' }}>
							<b style={{ color: '#004680', fontWeight: 'bold' }}>
								AI Recruiter makes the LifeCycle of Shortlisting Candidates for a Job easy.
							</b>
						</li>
						<p style={{ color: 'black', fontWeight: 'bold' }} />
						<p style={{ color: 'black', fontWeight: 'bold' }}>Features:</p>
						<li style={{ listStyleType: 'none', padding: '0.5rem' }}>
							<b style={{ color: '#004680', fontWeight: 'bold' }}>Admin Web App</b>: Creates & Lists the
							Available Jobs, Lists all the Applications for a Job & redirects to Dashboard.
						</li>
						<li style={{ listStyleType: 'none', padding: '0.5rem' }}>
							<b style={{ color: '#004680', fontWeight: 'bold' }}>User App</b>: User can apply for jobs by
							uploading his resume and also can interact with the chatbot.
						</li>
						<li style={{ listStyleType: 'none', padding: '0.5rem' }}>
							<b style={{ color: '#004680', fontWeight: 'bold' }}>Backend</b>: The flask server process
							the data and generate visual reports & shortlist candidates.
						</li>
					</div>
				</Card.Body>
			</Card>
		</div>
	);
};

export default About;

// 2d4d58
