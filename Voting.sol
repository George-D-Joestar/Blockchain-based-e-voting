// SPDX-License-Identifier: MIT 
// Author - George Tomy
// Start date - 5 February, 2026
/* log

    5 February, 2026
        Created struct Candidate, candidatelist mapping and candidatecount variable to store the list of candidates and their details
        created addCandidate() function to add candidates to the list
        created viewCandidate() function to view candidate details when given the candidate id

    10 February, 2026
        created removeCandidate()
        created vote()
        made necessary changes to viewCandidate() to return appropriate message if candidate is not found
        Created voters mapping to store the list of voters and check if a voter has already voted
        created votingactive variable to store the status of voting and check if voting is active before allowing certain actions
        Added onlyAdmin modifier to reduce code duplication
        Added events for transparency (CandidateAdded, CandidateRemoved, VoteCast, VotingStarted, VotingEnded)
        Added validCandidate modifier for candidate existence checks
        Added hasVoted(), getCandidateCount() helper functions
        Voter info (name, email, etc.) is stored off-chain in a database; only the hash is stored on-chain
        Winner determination is done off-chain by calling viewCandidate() for each candidate via getCandidateCount()

*/
pragma solidity >=0.8.0 <0.9.0;

contract Voting{

    address public admin;                                                                       //Variable to store the address of the admin

    constructor(){
        admin = msg.sender;                                                                     //Setting the admin as the address that deploys the contract
    }

    // ======================== Modifiers ========================

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier validCandidate(uint _cid) {
        require(_cid > 0 && _cid <= candidatecount, "Candidate not found");
        _;
    }

    // ======================== State Variables ========================

    bool public votingactive = false;                                                           // Status of voting (active/inactive)

    struct Candidate {
        uint Cid;                                                                               // Candidate id
        string Cname;                                                                           // Candidate name
        uint votes;                                                                             // Number of votes received
        bool active;                                                                            // Whether the candidate is active
    }

    mapping(uint => Candidate) candidatelist;                                                   // Mapping of candidate id => Candidate
    uint public candidatecount = 0;                                                             // Total number of candidates added

    mapping(bytes32 => bool) voters;                                                            // Mapping of voter hash => has voted (voter details stored off-chain)

    // ======================== Events ========================

    event VotingStarted();
    event VotingEnded();
    event CandidateAdded(uint indexed cid, string name);
    event CandidateRemoved(uint indexed cid);
    event VoteCast(uint indexed cid, bytes32 indexed voterHash);

    // ======================== Voting Control ========================

    function startVoting() public onlyAdmin {                                                   // Start the voting process
        require(!votingactive, "Voting is already active");
        votingactive = true;
        emit VotingStarted();
    }

    function endVoting() public onlyAdmin {                                                     // End the voting process
        require(votingactive, "Voting is not active");
        votingactive = false;
        emit VotingEnded();
    }

    // ======================== Candidate Management ========================
    
    function addCandidate(string memory _name) public onlyAdmin {                               // Add a candidate to the list
        require(!votingactive, "Cannot add candidates while voting is active");
        require(bytes(_name).length > 0, "Candidate name cannot be empty");
        candidatecount++;
        candidatelist[candidatecount] = Candidate({
            Cid: candidatecount,
            Cname: _name,
            votes: 0,
            active: true
        });
        emit CandidateAdded(candidatecount, _name);
    }

    function viewCandidate(uint _cid) public view validCandidate(_cid) returns (string memory, uint, bool) {
        Candidate memory c = candidatelist[_cid];                                               // Return candidate details (name, votes, active status)
        return (c.Cname, c.votes, c.active);
    }

    function removeCandidate(uint _cid) public onlyAdmin validCandidate(_cid) {                 // Soft-delete a candidate by deactivating them
        require(!votingactive, "Cannot remove candidates while voting is active");
        require(candidatelist[_cid].active, "Candidate is already inactive");
        candidatelist[_cid].active = false;
        emit CandidateRemoved(_cid);
    }

    function getCandidateCount() public view returns (uint) {                                   // Returns the total number of candidates
        return candidatecount;
    }

    // ======================== Voting ========================

    function vote(uint _cid, bytes32 _voterHash) public validCandidate(_cid) {                  // Vote for a candidate; _voterHash is the keccak256 hash of the voter's email (generated off-chain)
        require(votingactive, "Voting is not active");
        require(!voters[_voterHash], "This voter has already voted");
        require(candidatelist[_cid].active, "Candidate is not active");
        candidatelist[_cid].votes++;
        voters[_voterHash] = true;
        emit VoteCast(_cid, _voterHash);
    }

    function hasVoted(bytes32 _voterHash) public view returns (bool) {                          // Check if a voter hash has already been used
        return voters[_voterHash];
    }
}