import { css } from "@emotion/css";
import { EmailFilled } from "@navikt/ds-icons";
import { Button, Pagination, Table } from "@navikt/ds-react";
import capitalize from "lodash/capitalize";
import uniqBy from "lodash/uniqBy";
import React, { Fragment, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { AllMemberExport, MemberExportForRole } from "../../components/common/MemberExport";
import { UserImage } from "../../components/UserImage";
import type { TeamRole } from "../../constants";
import type { ResourceType } from "../../constants";
import { useTableSort } from "../../hooks/useTableSort";
import { intl } from "../../util/intl/intl";
import ModalContactMembers from "./ModalContactMembers";
import type { MembershipV2 } from "./TablePage";

const getTableTitle = (memberships: MembershipV2[]) => {
  const [searchParameters] = useSearchParams();

  const role = searchParameters.get("role") as TeamRole;
  const resourceType = searchParameters.get("resourceType") as ResourceType;

  if (role) {
    return `Medlemskap - Rolle: ${intl[role]} (${memberships.length})`;
  } else if (resourceType) {
    return `Medlemskap - ${intl[resourceType]} (${memberships.length})`;
  }

  return `Medlemskap (${memberships.length})`;
};

export function MembershipTable({ memberships }: { memberships: MembershipV2[] }) {
  const { sort, sortDataBykey, handleSortChange } = useTableSort();
  const [page, setPage] = useState(1);
  const rowsPerPage = 100;

  const [showContactMembersModal, setShowContactMembersModal] = useState<boolean>(false);

  const uniqueMembers = uniqBy(memberships, (membership) => membership.member.navIdent);

  const membersAsRowViewMembers = createMemberRowViewData(memberships);
  const sortedMembers = sortDataBykey(membersAsRowViewMembers, sort);
  const sortedMembersSliced = sortedMembers.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  if (memberships.length === 0) {
    return <p>Ingen medlemmer i teamet.</p>;
  }

  return (
    <Fragment>
      <div
        className={css`
          display: flex;
          justify-content: space-between;
          align-items: center;
        `}
      >
        <div>
          <h1>{getTableTitle(memberships)}</h1>
          <p>{uniqueMembers.length} medlemmer</p>
        </div>
        <div>
          <ShowCorrectExportButton />
          <Button
            className={css`
              margin-left: 1em;
            `}
            icon={<EmailFilled />}
            onClick={() => setShowContactMembersModal(true)}
            size="medium"
            variant="secondary"
          >
            Kontakt alle medlemmer
          </Button>
        </div>
      </div>
      <Table onSortChange={(sortKey) => handleSortChange(sortKey)} sort={sort}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell scope="col"> </Table.HeaderCell>
            <Table.ColumnHeader sortKey="name" sortable>
              Navn
            </Table.ColumnHeader>
            <Table.ColumnHeader sortKey="teamName" sortable>
              Team
            </Table.ColumnHeader>
            <Table.ColumnHeader sortKey="areaName" sortable>
              Område
            </Table.ColumnHeader>
            <Table.ColumnHeader sortKey="clusterName" sortable>
              Klynger
            </Table.ColumnHeader>
            <Table.ColumnHeader sortKey="role" sortable>
              Rolle
            </Table.ColumnHeader>
            <Table.ColumnHeader sortKey="description" sortable>
              Annet
            </Table.ColumnHeader>
            <Table.ColumnHeader sortKey="resourceType" sortable>
              Type
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sortedMembersSliced.map((member, index) => (
            <MemberRow key={index} member={member} />
          ))}
        </Table.Body>
      </Table>
      <div
        className={css`
          margin-top: 1em;
          display: flex;
          justify-content: center;
        `}
      >
        <Pagination
          count={Math.ceil(sortedMembers.length / rowsPerPage)}
          onPageChange={setPage}
          page={page}
          size="medium"
        />
        <ModalContactMembers
          isOpen={showContactMembersModal}
          memberships={memberships}
          onClose={() => setShowContactMembersModal(false)}
          title={"Kontakt alle medlemmer"}
        />
      </div>
    </Fragment>
  );
}

function ShowCorrectExportButton() {
  const [searchParameters] = useSearchParams();

  const { role, type } = Object.fromEntries(searchParameters);

  if (role) {
    return <MemberExportForRole role={role} />;
  }

  if (type) {
    return <></>;
  }

  return <AllMemberExport />;
}

function createMemberRowViewData(memberships: MembershipV2[]) {
  return memberships.map((membership) => {
    const resourceType = membership.member.resource.resourceType;
    const team = membership.team;
    const productArea = membership.area;
    const clusters = membership.clusters;

    let clusterNames = undefined;
    let clusterId = undefined;
    if (clusters) {
      if (clusters.length === 1) {
        clusterNames = clusters[0].name;
        if (clusters[0].id) {
          clusterId = clusters[0].id;
        }
      } else if (clusters.length > 1) {
        const clusterNameArray = clusters.map((cluster) => cluster.name);
        clusterNames = clusterNameArray.join(", ");
      }
    }
    return {
      navIdent: membership.member.navIdent,
      name: membership.member.resource.fullName,
      teamName: team ? team.name : "-",
      teamId: team && team.id ? team.id : undefined,
      areaName: productArea ? productArea.name : "-",
      areaId: productArea && productArea.id ? productArea.id : undefined,
      clusterName: clusters ? clusterNames : "-",
      clusterId: clusters && clusterId ? clusterId : undefined,

      role: membership.member.roles.map((role) => intl[role]).join(", "),
      description: capitalize(membership.member.description),
      resourceType: resourceType ? intl[resourceType] : "-",
    };
  });
}

function MemberRow({ member }: { member: ReturnType<typeof createMemberRowViewData>[0] }) {
  const {
    navIdent,
    name,
    teamName,
    teamId,
    areaName,
    areaId,
    clusterName,
    clusterId,
    role,
    description,
    resourceType,
  } = member;

  return (
    <Table.Row>
      <Table.DataCell>
        <UserImage navIdent={navIdent} size="32px" />
      </Table.DataCell>
      <Table.DataCell>
        <Link to={`/resource/${navIdent}`}>{name}</Link>
      </Table.DataCell>
      {teamId ? (
        <Table.DataCell>
          <Link to={`/team/${teamId}`}>{teamName}</Link>
        </Table.DataCell>
      ) : (
        <Table.DataCell>{teamName}</Table.DataCell>
      )}
      {areaId ? (
        <Table.DataCell>
          <Link to={`/area/${areaId}`}>{areaName}</Link>
        </Table.DataCell>
      ) : (
        <Table.DataCell>{areaName}</Table.DataCell>
      )}
      {clusterId ? (
        <Table.DataCell>
          <Link to={`/cluster/${clusterId}`}>{clusterName}</Link>
        </Table.DataCell>
      ) : (
        <Table.DataCell>{clusterName}</Table.DataCell>
      )}
      <Table.DataCell>{role}</Table.DataCell>
      <Table.DataCell>{description || "-"}</Table.DataCell>
      <Table.DataCell>{resourceType}</Table.DataCell>
    </Table.Row>
  );
}
