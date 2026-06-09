import Home from "../Home/Home.jsx";

// The legacy trending.html was a (non-functional) copy of home.html with no
// trending.js. We reuse the working Home feed so /trending is functional and
// visually matches; the navbar/bottom-nav highlight Trending via the route.
export default function Trending() {
  return <Home />;
}
