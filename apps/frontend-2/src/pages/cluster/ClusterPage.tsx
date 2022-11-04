import "dayjs/plugin/localizedFormat";

import { css } from "@emotion/css";
import { EditFilled } from "@navikt/ds-icons";
import SvgBellFilled from "@navikt/ds-icons/esm/BellFilled";
import { BodyShort, Button, Heading } from "@navikt/ds-react";
import dayjs from "dayjs";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import { getAllTeamsForCluster } from "../../api";
import { getAllClusters, getCluster } from "../../api/clusterApi";
import { AuditName } from "../../components/AuditName";
import DescriptionSection from "../../components/common/DescriptionSection";
import Members from "../../components/common/Members";
import Teams from "../../components/common/team/Teams";
import Divider from "../../components/Divider";
import { ErrorMessageWithLink } from "../../components/ErrorMessageWithLink";
import { Markdown } from "../../components/Markdown";
import PageTitle from "../../components/PageTitle";
import StatusField from "../../components/StatusField";
import { ResourceType, Status } from "../../constants";
import { user } from "../../services/User";
import { intl } from "../../util/intl/intl";
import type { PathParameters as PathParameters } from "../team/TeamPage";
import ShortClusterSummarySection from "../../components/cluster/ShortClusterSummarySection";

dayjs.locale("nb");

const ClusterPage = () => {
  const parameters = useParams<PathParameters>();

  const ClustersQuery = useQuery({
    queryKey: ["getCluster", parameters.id],
    queryFn: () => getCluster(parameters.id as string),
    enabled: !!parameters.id,
  });

  const allTeamsForClusterQuery = useQuery({
    queryKey: ["getAllTeamsForCluster", parameters.id],
    queryFn: () => getAllTeamsForCluster(parameters.id as string),
    enabled: !!parameters.id,
    select: (data) => data.content.filter((team) => team.status === Status.ACTIVE),
  });

  const cluster = ClustersQuery.data;
  const clusterMembers = cluster?.members ?? [];
  const teams = allTeamsForClusterQuery.data ?? [];

  const numberOfExternalMembers = (cluster?.members ?? []).filter(
    (member) => member.resource.resourceType === ResourceType.EXTERNAL
  ).length;

  return (
    <div>
      {ClustersQuery.isError && (
        <ErrorMessageWithLink
          errorMessage={intl.productAreaNotFound}
          href="/team"
          linkText={intl.linkToAllProductAreasText}
        />
      )}

      {cluster && (
        <>
          <PageTitle title={cluster.name} />

          <div
            className={css`
              display: flex;
              justify-content: space-between;
              align-items: center;
            `}
          >
            <div>
              <StatusField status={cluster.status} />
            </div>

            {cluster.changeStamp && (
              <div
                className={css`
                  margin-top: 2rem;
                  display: flex;
                  align-items: center;
                `}
              >
                <BodyShort
                  className={css`
                    margin-right: 2rem;
                  `}
                  size="small"
                >
                  <b>Sist endret av :</b> <AuditName name={cluster.changeStamp.lastModifiedBy} /> -{" "}
                  {dayjs(cluster.changeStamp?.lastModifiedDate).format("D. MMMM, YYYY H:mm ")}
                </BodyShort>

                {user.canWrite() && (
                  <Button
                    className={css`
                      margin-right: 1rem;
                    `}
                    icon={<EditFilled aria-hidden />}
                    size="medium"
                    variant="secondary"
                  >
                    {intl.edit}
                  </Button>
                )}
                <Button icon={<SvgBellFilled aria-hidden />} size="medium" variant="secondary">
                  Bli varslet
                </Button>
              </div>
            )}
          </div>

          <div
            className={css`
              display: flex;
              gap: 1rem;
              margin-top: 2rem;

              & > div {
                flex: 1;
              }
            `}
          >
            <DescriptionSection header="Beskrivelse" text={<Markdown source={cluster.description} />} />
            <ShortClusterSummarySection cluster={cluster} />
          </div>
        </>
      )}
      <Divider />
      <div
        className={css`
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
        `}
      >
        <Heading
          className={css`
            margin-right: 2rem;
            margin-top: 0;
          `}
          size="medium"
        >
          Team ({teams.length})
        </Heading>
        <Button
          className={css`
            margin-right: 1rem;
          `}
          size="medium"
          variant="secondary"
        >
          Eksporter team
        </Button>
      </div>
      <Teams teams={teams} />

      <Divider />
      <div
        className={css`
          display: flex;
          justify-content: left;
          align-items: center;
          margin-bottom: 2rem;
        `}
      >
        <Heading
          className={css`
            margin-right: 2rem;
            margin-top: 0;
          `}
          size="medium"
        >
          Medlemmer på klyngenivå ({cluster?.members.length})
        </Heading>
        {numberOfExternalMembers > 0 && clusterMembers.length > 0 && (
          <b>
            Eksterne {numberOfExternalMembers} ({((numberOfExternalMembers / clusterMembers.length) * 100).toFixed(0)}
            %)
          </b>
        )}
      </div>
      {clusterMembers.length > 0 ? <Members members={clusterMembers} /> : <></>}
    </div>
  );
};

export default ClusterPage;