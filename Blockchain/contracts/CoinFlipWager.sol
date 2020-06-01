import "./Ownable.sol";
pragma solidity 0.5.12;

contract CoinFlipWager is Ownable{

    function placeWager(string memory betOption, uint betAmount) public payable returns(uint) {
        // Flip the coin
        uint flipResult = flip();

        return flipResult;
    }

    // Coin flip
    //  0 - heads
    //  1 - tails
    function flip() public view returns (uint) {
        return now % 2;
    }
}
