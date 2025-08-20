import React, { useState } from 'react';

const [pincode, setPincode] = useState<string>('');

type PincodeScreenProps = {
  navigation: any; // Replace 'any' with the correct type from React Navigation if available
};

