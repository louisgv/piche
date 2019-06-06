import React from 'react';
import PropTypes from 'prop-types';
import {Text} from 'ink';

import http from 'http'
import handler from 'serve-handler'


/// Hello world command
const Piche = ({name}) => {



	return (
		<Text>Hello, {name}</Text>
	);
}

Piche.propTypes = {
	/// Name of the person to greet
	name: PropTypes.string.isRequired
};

export default Piche;
