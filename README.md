# **Blockchain-Based Voting System - Unit Tests**

This repository focuses solely on the **unit testing component** of the Blockchain-Based Voting System project. Unit testing was a critical step to ensure the reliability, security, and functionality of the smart contracts.

---

## **Project Overview**

The Blockchain-Based Voting System provides a secure and transparent voting platform that guarantees voter privacy and election integrity. The system uses smart contracts for:

- **Voter Registration**
- **Ballot Casting**
- **Result Tallying**

This repository contains only the **unit tests** developed for the project. **Other parts of the project, such as contract development, deployment, and additional features, are not included here, as they were handled by other team members.**

---

## **QA Testing Contributions**

As the QA Tester, I contributed to the following:

- **Designing and Implementing Unit Tests**:  
  Created test cases using **Hardhat**, **Mocha**, and **Chai** to validate critical features like voter registration, ballot casting, and result tallying.

- **Analyzing Test Coverage**:  
  Conducted detailed coverage analysis using **Istanbul**, achieving over **96% statement coverage** across the contracts.

- **Identifying and Reporting Bugs**:  
  Discovered edge cases and functional issues to enhance system reliability.

- **Collaborating with Developers**:  
  Worked with the development team to resolve issues and optimize contracts.

- **Ensuring Security and Robustness**:  
  Tested scenarios like invalid inputs, access control failures, and duplicate operations.

---

## **Unit Tests Included**

Unit tests were developed for the following smart contracts:

1. **Ballot**: Manages candidate registration and admin controls.
2. **ElectionAdmin**: Oversees the election lifecycle (start, pause, resume, end).
3. **ResultTallying**: Aggregates votes and declares winners.
4. **VoteCasting**: Secures voting using zk-SNARK proofs.
5. **VoteCastingEncrypted**: Adds encryption for vote confidentiality.
6. **VoterRegistry**: Manages voter registration and authentication.

---

## **Test Coverage Results**

The following test coverage was achieved:

| **Metric**    | **Coverage**  |
|---------------|---------------|
| **Statements** | 96.23%       |
| **Branches**   | 82.81%       |
| **Functions**  | 92.31%       |
| **Lines**      | 96.25%       |

---

## **Scope of This Repository**

This repository contains only the **unit testing component** of the project. The other components, such as contract development, deployment, and additional testing layers, are managed by other team members and are not part of this repository.

---

## **Getting Started**

1. Clone the repository:
   ```bash
   git clone <>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the tests:
   ```bash
   npx hardhat test
   ```
4. View coverage:
   ```bash
   npx hardhat coverage
   ```
