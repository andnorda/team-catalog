import inRange from "lodash/inRange";

import type { ProductTeam } from "../../constants";
import { ResourceType } from "../../constants";
import { JohannesChart } from "./JohannesChart";

// TODO får feil tall for "ingen eksterne i dev fordi den teller ikke med team som har 0 medlemmer
export function TeamExternalChart({ teams }: { teams: ProductTeam[] }) {
  const data = formatData(teams);

  return <JohannesChart rows={data} title="Andel eksterne i teamene" />;
}

function formatData(teams: ProductTeam[]) {
  return [
    formatDataRow("Ingen eksterne", teams, [0, 1]),
    formatDataRow("1-25% eksterne", teams, [1, 26]),
    formatDataRow("26-50% eksterne", teams, [26, 51]),
    formatDataRow("51-75% eksterne", teams, [51, 76]),
    formatDataRow("76-100% eksterne", teams, [76, 101]),
  ];
}

function formatDataRow(label: string, teams: ProductTeam[], range: [number, number]) {
  const teamExternalMembersPercentage = teams.map((team) => {
    return team.members.length === 0 ? 0 : getExternalPercentage(team);
  });

  const membersInSegment = teamExternalMembersPercentage.filter((n) => inRange(n, range[0], range[1]));

  const numberOfMembers = membersInSegment.length;

  const percentage = Math.round((membersInSegment.length / teamExternalMembersPercentage.length) * 100);
  const searchParameters = `percentageOfExternalLessThan=${range[1]}&percentageOfExternalGreaterThan=${
    range[0] - 1
  }&filterName=Teams med ${label.toLowerCase()}`;

  return {
    label,
    percentage,
    value: numberOfMembers,
    url: `/teams/filter?${searchParameters}`,
  };
}

export function getExternalPercentage(team: ProductTeam) {
  const externalMembers = team.members.filter((member) => member.resource.resourceType === ResourceType.EXTERNAL);

  return Math.round((externalMembers.length / team.members.length) * 100);
}
