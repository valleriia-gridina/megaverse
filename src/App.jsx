import { useState } from "react";
import classNames from "classnames";
import {
  BASE_URL,
  CANDIDATE_ID,
  planetNamesMap,
  planetUrlsMap,
} from "./constants";
import { getName, getParam } from "./utils";
import "./styles/common.scss";
import styles from "./App.module.scss";

const App = () => {
  const [planetMap, setPlanetMap] = useState(null);
  const [initialPlanet, setInitialPlanet] = useState(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onGetData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}map/${CANDIDATE_ID}/goal`);
      const data = await response.json();
      const myPlanet = data.goal;
      setInitialPlanet(myPlanet);
      setPlanetMap(getPlanetMap(myPlanet));
      setIsLoading(false);
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  };

  const getPlanetMap = (planet) =>
    planet.reduce((acc, row, rowIndex) => {
      row.forEach((item, itemIndex) => {
        const planetName = getName(item);
        const extraParam = getParam(item);

        const generateObjParams = (name, acc, row, column, prop, propValue) => {
          const paramsObj = prop
            ? { row, column, url: planetUrlsMap[name], [prop]: propValue }
            : { row, column, url: planetUrlsMap[name] };
          return acc ? [...acc, paramsObj] : paramsObj;
        };

        if (item !== planetNamesMap.SPACE) {
          if (item.includes(planetNamesMap.SOLOON)) {
            acc = [
              ...acc,
              generateObjParams(
                planetName,
                acc[planetName],
                rowIndex,
                itemIndex,
                "color",
                extraParam
              ),
            ];
          } else if (item.includes(planetNamesMap.COMETH)) {
            acc = [
              ...acc,
              generateObjParams(
                planetName,
                acc[planetName],
                rowIndex,
                itemIndex,
                "direction",
                extraParam
              ),
            ];
          } else {
            acc = [
              ...acc,
              generateObjParams(item, acc[item], rowIndex, itemIndex),
            ];
          }
        }
      });
      return acc;
    }, []);

  const onPostData = async () => {
    setIsLoading(true);
    for (const request of planetMap) {
      const { url, ...rest } = request;
      try {
        await fetch(`${BASE_URL}${url}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...rest,
            candidateId: CANDIDATE_ID,
          }),
        });
      } catch (error) {
        console.log(`Error: ${error}`);
        setIsError(true);
      }
    }
    setIsLoading(false);
  };

  return (
    <div className={styles.wrapper}>
      {!isLoading && isError && (
        <h2>
          Oops, someting went wrong. Please try to post your Megaverse again!
          You will do your best &#40;:
        </h2>
      )}

      {!isLoading && initialPlanet && (
        <div className={styles.map}>
          {initialPlanet.map((row) => (
            <div key={Math.random()}>
              {row.map((item) => (
                <span
                  key={Math.random()}
                  className={classNames(
                    styles.planet,
                    styles[
                      item.includes("_")
                        ? getName(item).toLowerCase()
                        : item.toLowerCase()
                    ]
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      )}
      {isLoading && <h3 className={styles.loading}>Loading...</h3>}
      <div className={styles.btns}>
        <button className={styles.btn} onClick={onGetData}>
          Get Megaverse map
        </button>
        <button className={styles.btn} onClick={onPostData}>
          Post Megaverse
        </button>
      </div>
    </div>
  );
};

export default App;
