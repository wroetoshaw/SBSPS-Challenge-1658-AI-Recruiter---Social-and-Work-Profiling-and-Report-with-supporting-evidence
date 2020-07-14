import React, { useState, useEffect } from 'react';
import './Home.css';
import { Button, Modal, Form, Row, Col, Card } from 'react-bootstrap';
import { Link, useRouteMatch } from 'react-router-dom';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import RangeSlider from 'react-bootstrap-range-slider';
import Loader from 'react-loader-spinner';

const get_jobs_url = `http://0.0.0.0:4003/jobs`;

const Home = () => {
	const [ modalShow, setModalShow ] = useState(false);
	const [ dataShow, setDataShow ] = useState(false);
	const [ text, setText ] = useState('');
	const [ skills, setskills ] = useState('');
	const [ description, setDescription ] = useState('');
	const [ jobdata, setjobData ] = useState([]);
	const [ isLoading, setIsLoading ] = useState(false);

	const [ rangervalue, setRangerValue ] = useState(50);
	const [ rangervalueExp, setRangerValueExp ] = useState(50);
	const [ rangervalueGit, setRangerValueGit ] = useState(50);
	const [ rangervalueAcademics, setRangerValueAcademics ] = useState(50);

	const handleText = (event) => {
		setText(event.target.value);
	};

	const handleDescription = (event) => {
		setDescription(event.target.value);
	};

	const handleSkills = (event) => {
		setskills(event.target.value);
	};

	const handleRanger = (event) => {
		setRangerValue(Number(event.target.value));
	};
	const handleRangerExp = (event) => {
		setRangerValueExp(Number(event.target.value));
	};
	const handleRangerGit = (event) => {
		setRangerValueGit(Number(event.target.value));
	};
	const handleRangerAcademics = (event) => {
		setRangerValueAcademics(Number(event.target.value));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		const data = {
			jobTitle: text,
			description,
			skills,
			score_skills: String(rangervalue),
			score_exp: String(rangervalueExp),
			score_github: String(rangervalueGit),
			score_academics: String(rangervalueAcademics)
		};

		console.log(data);

		const options = {
			mode: 'cors',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json;charset=utf-8',
				Accept: 'application/json'
			},
			body: JSON.stringify(data)
		};

		const response = await fetch(`http://0.0.0.0:4003/createform`, options);
		const result = await response.json();
		console.log(`result ${result}`);
		console.log('submit called');

		alert(result.message);
		setModalShow(false);
		setDataShow(true);
	};

	useEffect(
		() => {
			setIsLoading(true);

			const fetchData = async () => {
				const response = await fetch(get_jobs_url);
				const result = await response.json();
				console.log(result);
				console.log(result[0]);

				setjobData(result);
				setIsLoading(false);
			};
			console.log('called');

			fetchData();
			setDataShow(false);
		},
		[ dataShow ]
	);

	return (
		<div className="App">
			<div className="App-header">
				<Button className="job-button" variant="primary" onClick={() => setModalShow(true)}>
					Add Job
				</Button>
			</div>

			<div className="App-body">
				<ViewModal
					show={modalShow}
					text={text}
					description={description}
					skillstext={skills}
					onTextInput={handleText}
					onSkillsInput={handleSkills}
					onDescriptionInput={handleDescription}
					onSubmitInput={handleSubmit}
					rangervalue={rangervalue}
					rangervalueExp={rangervalueExp}
					rangervalueGit={rangervalueGit}
					rangervalueAcademics={rangervalueAcademics}
					onRangerInput={handleRanger}
					onRangerInputExp={handleRangerExp}
					onRangerInputGit={handleRangerGit}
					onRangerInputAcademics={handleRangerAcademics}
					onHide={() => setModalShow(false)}
				/>
				{isLoading ? (
					<div
						style={{
							position: 'absolute',
							left: '50%',
							top: '50%',
							transform: 'translate(-50%, -50%)'
						}}
					>
						<Loader
							type="Oval"
							color="black"
							height={100}
							width={100}
							timeout={10000} //3 secs
						/>
					</div>
				) : (
					<DataList jobdata={jobdata} />
				)}
			</div>
		</div>
	);
};

const ViewModal = (props) => {
	return (
		<div>
			<Modal {...props} size="md" aria-labelledby="contained-modal-title-vcenter" centered>
				<Modal.Header closeButton className="form-header">
					<Modal.Title id="contained-modal-title-vcenter">Create Job</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<CreateForm
						onTextInput={props.onTextInput}
						onDescriptionInput={props.onDescriptionInput}
						onSkillsInput={props.onSkillsInput}
						onSubmitInput={props.onSubmitInput}
						rangervalue={props.rangervalue}
						rangervalueExp={props.rangervalueExp}
						rangervalueGit={props.rangervalueGit}
						rangervalueAcademics={props.rangervalueAcademics}
						onRangerInput={props.onRangerInput}
						onRangerInputExp={props.onRangerInputExp}
						onRangerInputGit={props.onRangerInputGit}
						onRangerInputAcademics={props.onRangerInputAcademics}
					/>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="danger" onClick={props.onHide}>
						Close
					</Button>

					<Button variant="primary" type="submit" onClick={props.onSubmitInput}>
						Submit
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};

const CreateForm = ({
	onTextInput,
	onDescriptionInput,
	onSkillsInput,
	rangervalue,
	onRangerInput,
	rangervalueExp,
	rangervalueGit,
	rangervalueAcademics,
	onRangerInputExp,
	onRangerInputGit,
	onRangerInputAcademics
}) => {
	return (
		<div>
			<Form>
				<Form.Group>
					<Row>
						<Form.Label column lg={3}>
							Job Title
						</Form.Label>
						<Col>
							<Form.Control type="text" onChange={onTextInput} /> <br />
						</Col>
					</Row>
				</Form.Group>
				<Form.Group>
					<Row>
						<Form.Label column lg={3}>
							Skills
						</Form.Label>
						<Col>
							<Form.Control type="text" onChange={onSkillsInput} /> <br />
						</Col>
					</Row>
				</Form.Group>

				<Form.Group controlId="exampleForm.ControlTextarea1">
					<Form.Label>Job Description</Form.Label>
					<Form.Control as="textarea" rows="5" onChange={onDescriptionInput} />
				</Form.Group>

				<Form.Label>
					<b>Scoring Control</b>
				</Form.Label>

				<Form.Group>
					<Row>
						<Form.Label column lg={3}>
							Skill
						</Form.Label>
						<Col>
							<RangeSlider value={rangervalue} onChange={onRangerInput} />
							<br />
						</Col>
					</Row>
					<Row>
						<Form.Label column lg={3}>
							Experience
						</Form.Label>
						<Col>
							<RangeSlider value={rangervalueExp} onChange={onRangerInputExp} />
							<br />
						</Col>
					</Row>
					<Row>
						<Form.Label column lg={3}>
							Github
						</Form.Label>
						<Col>
							<RangeSlider value={rangervalueGit} onChange={onRangerInputGit} />
							<br />
						</Col>
					</Row>
					<Row>
						<Form.Label column lg={3}>
							Academics
						</Form.Label>
						<Col>
							<RangeSlider value={rangervalueAcademics} onChange={onRangerInputAcademics} />
							<br />
						</Col>
					</Row>
				</Form.Group>
			</Form>
		</div>
	);
};

const DataList = ({ jobdata }) => {
	let { path, url } = useRouteMatch();

	return jobdata.map((item) => {
		return (
			<div>
				<Card className="job-card">
					<Card.Header className="job-card-header">
						<div>
							<span>
								<h2 className="job-title">{item.jobTitle}</h2>
							</span>
						</div>
					</Card.Header>
					<Card.Body className="card-body">
						<div className="card-headings">
							<i class="fas fa-tools fa-fw fa-1x" />
							<span className="card-headings-text">Skills</span>
						</div>
						<Card.Text>
							<li style={{ marginLeft: '2.4rem' }}>
								<h3 className="card-text">{item.skills} </h3>
							</li>
						</Card.Text>
						<div class="card-headings">
							<i class="fas fa-clipboard-list fa-fw fa-1x" />
							<span className="card-headings-text">Job Description </span>
						</div>
						<Card.Text className="job-description">
							<li style={{ marginLeft: '2.4rem' }}>
								<h3>{item.description}</h3>
							</li>
						</Card.Text>
					</Card.Body>

					<Link to={`${url}/viewresponses/${item.jobTitle}`} style={{ textAlign: 'center', padding: '1rem' }}>
						<Button className="button" variant="primary" type="submit">
							View Responses
						</Button>
					</Link>
				</Card>
			</div>
		);
	});
};

export default Home;
// →
