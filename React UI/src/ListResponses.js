import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { useRouteMatch } from 'react-router-dom';
import './ListResponses.css';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import Loader from 'react-loader-spinner';

const job_response_url = `http://173.193.106.20:32327/jobs`;
const dash_url = `http://173.193.106.20:32327/dash`;

const ListResponse = ({ match }) => {
	console.log('listresponse is clicked');

	const [ jobids, setjobids ] = useState([]);
	const [ isLoading, setIsLoading ] = useState(false);

	useEffect(() => {
		setIsLoading(true);
		const fetchjobresponse = async () => {
			const options = {
				mode: 'cors',
				method: 'GET',
				headers: {
					Accept: 'application/json'
				}
			};
			const response = await fetch(`${job_response_url}/${match.params.jobtitle}`, options);
			const result = await response.json();
			setjobids(result);
			setIsLoading(false);
			// console.log(typeof result);
			console.log(result);
			console.log(response);
		};

		fetchjobresponse();
	}, []);

	return (
		<div>
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
						timeout={20000} //20 secs
					/>
				</div>
			) : (
				<div>
					<h2 className="table-title"> {match.params.jobtitle} Applications </h2>

					<div className="list">
						<div className="table-layout">
							<table className="table">
								<tbody>
									<tr>
										<th>Application ID</th>
										<th>Outputs</th>
										<th>Shortlisted</th>
										<th>Score</th>
									</tr>
									<DataList jobids={jobids} />
								</tbody>
							</table>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

const DataList = ({ jobids }) => {
	let { path, url } = useRouteMatch();

	return jobids.map((item) => {
		return (
			<tr>
				<td>{item.applicationId}</td>
				<td>
					<a href={`${dash_url}/${item.applicationId}`} target="_blank">
						<Button variant="primary" type="submit" style={{ background: 'none', color: 'blue' }}>
							View Output
						</Button>
					</a>
				</td>
				<td>{item.shortlisted}</td>
				<td>{item.overall_score}</td>
			</tr>
		);
	});
};

export default ListResponse;

/* <h6>{item.jobid} </h6> */
/* <Link to={`http://173.193.106.20:32327/dash/${item.jobid}`}>
					<Button variant="primary" type="submit" onClick={}>
						View Output
					</Button>
				</Link> */
/* <a href={`http://173.193.106.20:32327/dash/${item.jobid}`} target="_blank">
					<Button variant="primary" type="submit">
						View Output
					</Button>
				</a> */
/* <div dangerouslySetInnerHTML={{ __html: `${buff}` }} /> */
