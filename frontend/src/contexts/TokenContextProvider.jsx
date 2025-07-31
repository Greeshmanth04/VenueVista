import { useState } from "react";
import { tokenContext } from "./TokenContext";

function TokenContextProvider({children}) {

  let [token, setToken] = useState("");

  return (
    <tokenContext.Provider value={[token, setToken]}>
        {children}
    </tokenContext.Provider>
  );
}

export default TokenContextProvider;