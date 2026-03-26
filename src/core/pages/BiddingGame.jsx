import { useState } from "react";
import Lineup from "../components/Lineup";
import BiddingPlayer from "../components/BiddingPlayer";
import { useLocation } from "react-router";

const BiddingGame = () => {

  const {state} = useLocation()
  const lineUp = useState(state?.lineUp ?? null)
  console.log("Lineup pasado por router",lineUp)
  return (
    <>
      <BiddingPlayer></BiddingPlayer>
      <Lineup lineUp={lineUp}></Lineup>
    </>
  );
};

export default BiddingGame;
