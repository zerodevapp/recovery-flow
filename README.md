# @zerodev/recovery

This package helps dApp developers to easily integrate a recovery option for Kernel smart contract wallets. The `useKernelAccountRecovery` hook opens a popup for users to set up a guardian without the dApp needing to implement its own recovery flow.

## Installation

To install the package, run the following command:

```bash
npm install @zerodev/recovery
```

or

```bash
yarn add @zerodev/recovery
```

## Usage
Here is how you can use `useKernelAccountRecovery` hook in your React application:

```jsx
import React from 'react';
import { useKernelAccountRecovery } from "@zerodev/recovery";

function App() {
  const kernelAddress = '0x...'; // Replace with the actual kernel address
  const suggestedGuardianAddress = '0x...'; // Replace with the actual suggested guardian address
  const chainId = 1; // Replace with the actual chain ID

  const { openRecoveryPopup, error, recoveryEnabled, guardians, isPending } = useKernelAccountRecovery({
    address: kernelAddress,
    chainId,
    suggestedGuardianAddress, // optional
    onSetupGuardianRequest: async (userOpCallData) => {
      // Implement the logic to handle the user operation call data
    }
  });

  return (
    <div>
      <button onClick={openRecoveryPopup}>Manage Recovery Guardians</button>
      {error && <p>Error: {error}</p>}
      {isPending && <p>Guardian update in progress...</p>}
      {recoveryEnabled && (
        <div>
          <h3>Guardians</h3>
          {guardians.map((guardian, index) => (
            <p key={index}>{guardian}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
```

## `useKernelAccountRecovery` Hook API

### Input Properties

| Property                | Type                      | Description                                                          | Required |
|-------------------------|---------------------------|----------------------------------------------------------------------|----------|
| `address`               | `string`                  | The address of the account for which to manage recovery.             | Yes      |
| `chainId`               | `number`                  | The ID of the blockchain network.                                    | Yes      |
| `onSetupGuardianRequest`| `function`                | This is a callback function that processes user operation call data. The popup assembles this call data based on user preferences and then forwards it to this callback function for your implementation to manage.                | Yes      |
| `defaultGuardianAddress`| `string`                  | (Optional) A pre-specified guardian address to prefill in the popup, ideal for suggesting your wallet as a guardian. While this address is set as the prefilled option, users retain the option to modify it within the popup as needed.       | No       |

### Output Properties

| Property                | Type                      | Description                                                          |
|-------------------------|---------------------------|----------------------------------------------------------------------|
| `openRecoveryPopup`     | `function`                | Function to open the recovery popup.                                 |
| `error`                 | `string` \| `undefined`   | An error message if an error occurs, otherwise undefined.            |
| `recoveryEnabled`       | `boolean`                 | Indicates whether the account has guardians set up.                  |
| `guardians`             | `string[]`                | Array of guardian addresses.                                         |
| `isPending`             | `boolean`                 | Indicates whether the process of setting a guardian is currently active. This will be true if the popup is open or if the hook is awaiting guardian confirmation after the user's selection.          |



## Contributing
If you have suggestions for how @zerodev/recovery could be improved, or want to report a bug, open an issue or a pull request.
