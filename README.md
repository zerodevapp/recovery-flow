# @zerodev/recovery

This package offers UI components for DApp developers to easily integrate account recovery.  The `useKernelAccountRecovery` hook opens a pop-up that guides the user through setting up a guardian.

The component only assumes that the account is running [Kernel](https://github.com/zerodevapp/kernel) -- it doesn't make any assumption about the SDK you are using to send UserOps, so it's compatible with any SDK.

You can see a demo here:

- [Demo](https://recovery-demo.zerodev.app) 
- [Demo code](https://github.com/zerodevapp/recovery-demo)

The guardian can complete recovery at the [recovery portal](https://recovery.zerodev.app).

## Use Cases

There are two typical use cases that this recovery flow supports:

- Second-factory recovery
  - The user sets a second factory they own as the guardian for their account.  For example, if could be another wallet they own, a passkey device, etc.

- DApp-assisted recovery
  - The user sets a wallet that the DApp owns as their guardian.  Then, when the user needs to recover their account, they reach out to the DApp and the DApp recovers for them.
    - To suggest that the user set a specific DApp wallet as guardian, use the `suggestedGuardianAddress` flag below.

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

Here is how to use the `useKernelAccountRecovery` hook in your React application:

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
      // Implement the logic to send the UserOp
      // For example, if you are using the ZeroDev SDK, you could do:
      //
      // await ecdsaProvider.sendUserOperation(userOpCallData)
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
| `suggestedGuardianAddress`| `string`                  | (Optional) A pre-specified guardian address to prefill in the popup, ideal for suggesting your wallet as a guardian. While this address is set as the prefilled option, users retain the option to modify it within the popup as needed.       | No       |

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
