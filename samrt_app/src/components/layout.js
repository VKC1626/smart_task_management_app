import Login from "./login";

function Layout() {
  return (
    <div className="main_layout">
      <div
        style={{
          backgroundColor: "aqua",
          fontFamily: "times new roman",
          fontStyle: "italic",
        }}>
        <marquee behavior="scroll" direction="left">
          Welcome to Smart Task Management App
        </marquee>
      </div>

      <Login />
    </div>
  );
}

export default Layout;
