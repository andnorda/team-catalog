import { css } from "@emotion/css";
import { Heading, Label, LinkPanel } from "@navikt/ds-react";
import React from "react";
import { useNavigate } from "react-router-dom";

import teamCardIcon from "../../assets/teamCardIcon.svg";
import type { DashData, ProductAreaSummary2 } from "../../components/dash/Dashboard";
import { useDash } from "../../components/dash/Dashboard";
import type { ProductArea } from "../../constants";
import { AreaType } from "../../constants";
import ProductAreaCard, { paCardInterface } from "./ProductAreaCard";

const categoryStyle = css`
  width: 100%;
  margin-bottom: 3rem;
`;

const areaDivStyle = css`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: space-between;
`;

type ProductAreaCardListProperties = {
  areaList: ProductArea[];
};

const productAreas = (areaList: ProductArea[], type: AreaType, dash: DashData | undefined): paCardInterface[] => {
  const out: paCardInterface[] = [];

  const areas = areaList.filter((p: ProductArea) => p.areaType === type);

  if (dash) {
    for (const area of areas) {
      const currentAreaSummary = dash.areaSummaryMap[area.id];
      const currentPa: paCardInterface = {
        name: area.name,
        paInfo: currentAreaSummary,
        id: area.id,
      };
      out.push(currentPa);
    }
  }

  return out;
};

const ProductAreaCardList = (properties: ProductAreaCardListProperties) => {
  const { areaList } = properties;
  const dash = useDash();
  const navigate = useNavigate();

  console.log({ dash });

  return (
    <React.Fragment>
      <div className={areaDivStyle}>
        <div className={categoryStyle}>
          <Heading
            className={css`
              margin-bottom: 1rem;
            `}
            level="2"
            size="medium"
          >
            Produktområder
          </Heading>
          <div className={areaDivStyle}>
            {productAreas(areaList, AreaType.PRODUCT_AREA, dash).map((element) =>
              ProductAreaCard(element, "#C9E7D1", navigate)
            )}
          </div>
        </div>
        <div className={categoryStyle}>
          <Heading
            className={css`
              margin-bottom: 1rem;
            `}
            level="2"
            size="medium"
          >
            IT-område
          </Heading>
          <div className={areaDivStyle}>
            {productAreas(areaList, AreaType.IT, dash).map((element) => ProductAreaCard(element, "#C3E0EA", navigate))}
          </div>
        </div>
        <div className={categoryStyle}>
          <Heading
            className={css`
              margin-bottom: 1rem;
            `}
            level="2"
            size="medium"
          >
            Prosjekt
          </Heading>
          <div className={areaDivStyle}>
            {productAreas(areaList, AreaType.PROJECT, dash).map((element) =>
              ProductAreaCard(element, "#E4E8BC", navigate)
            )}
          </div>
        </div>
        <div className={categoryStyle}>
          <Heading
            className={css`
              margin-bottom: 1rem;
            `}
            level="2"
            size="medium"
          >
            Annet
          </Heading>
          <div className={areaDivStyle}>
            {productAreas(areaList, AreaType.OTHER, dash).map((element) =>
              ProductAreaCard(element, "#E0D8E9", navigate)
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ProductAreaCardList;