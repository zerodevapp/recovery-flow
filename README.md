# @zerodev/{name_tbd}

This package helps dApp developers to easily integrate a recovery option for Kernel smart contract wallets. The `useKernelAccountRecovery` hook opens a popup for users to set up a guardian without the dApp needing to implement its own recovery flow.

## Installation

To install the package, run the following command:

```bash
npm install @zerodev/{name_tbd}
```

or

```bash
yarn add @zerodev/{name_tbd}
```

## Usage
Here is how you can use `useKernelAccountRecovery` hook in your React application:

```jsx
import React from 'react';
import { useKernelAccountRecovery } from "@zerodev/{name_tbd}";

function App() {
  const kernelAddress = '0x...'; // Replace with actual kernel address
  const { openRecoveryPopup, error } = useKernelAccountRecovery({
    address: kernelAddress,
    onSetupGuardianRequest: async (userOpCallData) => {
      // Implement the logic to send the user operation call data
    }
  });

  return (
    <div>
      <button onClick={openRecoveryPopup}>Set Recovery Guardian</button>
      {error && <p>Error: {error}</p>}
    </div>
  );
}

export default App;
```

## Contributing
If you have suggestions for how @zerodev/{name_tbd} could be improved, or want to report a bug, open an issue or a pull request.
