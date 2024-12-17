import React, { createContext, useState } from 'react';
import PropTypes from 'prop-types';

const ResourceContext = createContext();

export function ResourceProvider({ children }) {
  const [resource, setResource] = useState({});

  return (
    <ResourceContext.Provider value={{ resource, setResource }}>
      {children}
    </ResourceContext.Provider>
  );
}

// Define prop types for ResourceProvider
ResourceProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ResourceContext;