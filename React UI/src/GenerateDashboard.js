import React, { useState, useEffect } from 'react';

const applicantion_response_url = `http://0.0.0.0:4003/dash`;

const GenerateDashbaord = ({ match }) => {
	console.log('GenerateDashbaord is clicked');

	const [ applicationid, setapplicationid ] = useState([]);

	useEffect(() => {
		const fetchjobresponse = async () => {
			const options = {
				mode: 'cors',
				method: 'GET',
				headers: {
					Accept: 'application/json'
				}
			};
			const response = await fetch(`${applicantion_response_url}/${match.params.applicationid}`, options);
			const result = await response.json();
			setapplicationid(result);

			// console.log(typeof result);
			console.log(result);
		};

		fetchjobresponse();
	}, []);

	return (
		<div>
			<h1>{match.params.applicationid}</h1>
			<Decodehtml applicationid={applicationid} />
		</div>
	);
};

const Decodehtml = ({ applicationid }) => {
	// const html_markup = Buffer.from(encodeddata, 'base64').toString('ascii');

	return applicationid.map((item) => {
		const encodeddata = item.html;
		const buff = Buffer.from(encodeddata, 'base64').toString('ascii');
		// console.log(buff);

		return (
			<div>
				<h1>hello</h1>
				<div dangerouslySetInnerHTML={{ __html: `${buff}` }} />
			</div>
		);
	});
};

export default GenerateDashbaord;
