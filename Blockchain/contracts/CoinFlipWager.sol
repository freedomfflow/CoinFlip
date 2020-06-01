import "./Ownable.sol";
pragma solidity 0.5.12;

contract CoinFlipWager is Ownable{

    function placeWager() public view returns(uint) {
        return 1;
    }

    function flip() public view returns (uint) {
        return now % 2;
    }
}
