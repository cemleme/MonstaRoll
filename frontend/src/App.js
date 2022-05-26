import Header from "./components/Header";
import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import Landing from "./pages/Landing";
import Bet from "./pages/Bet";
import Nfts from "./pages/Nfts";
import Raffle from "./pages/Raffle";
import Market from "./pages/Market";


function App() {
  return (
    <div>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="bets" element={<Bet />} />
          <Route path="nfts" element={<Nfts />} />
          <Route path="market" element={<Market />} />
          <Route path="raffle" element={<Raffle />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
