import React, { useEffect, useState } from "react"
import axios from 'axios'
import { TeamRole } from '../../constants'
import { env } from '../../util/env'
import { TextWithLabel } from '../common/TextWithLabel'
import { Spinner } from 'baseui/spinner'
import { theme } from '../../util'
import { Block } from 'baseui/block'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle } from '@fortawesome/free-solid-svg-icons'
import { intl } from '../../util/intl/intl'
import { Label1 } from 'baseui/typography'

interface DashData {
  teams: number
  teamsEditedLastWeek: number
  teamEmpty: number
  teamUpTo5: number
  teamUpTo10: number
  teamUpTo20: number
  teamOver20: number
  uniqueResourcesInATeam: number
  resources: number
  roles: Role[]
}

interface Role {
  role: TeamRole
  count: number
}

export const getDashboard = async () => {
  return (await axios.get<DashData>(`${env.teamCatalogBaseUrl}/dash`)).data;
};

export const DashboardPage = () => {
  const [dash, setDash] = useState<DashData>()

  useEffect(() => {
    (async () => {
      setDash(await getDashboard())
    })()
  }, [])

  if (!dash) return <Spinner size={theme.sizing.scale750} />

  return (
    <Block >
      <Block width='80%' display='flex' flexWrap justifyContent='space-between'>
        <TextWithLabel label={'Registrerte teams'} text={dash.teams} />
        <TextWithLabel label={'Team redigert sist uke'} text={dash.teamsEditedLastWeek} />
        <TextWithLabel label={'Antall personer tilknyttet team'} text={dash.uniqueResourcesInATeam} />
      </Block>

      <Block width='100%' marginTop={theme.sizing.scale400}>
        <Pie title='Antall medlemmer per team'
          data={[
            { label: 'Ingen medlemmer', size: dash.teamEmpty },
            { label: 'Opp til 5 medlemmer', size: dash.teamUpTo5 },
            { label: 'Opp til 10 medlemmer', size: dash.teamUpTo10 },
            { label: 'Opp til 20 medlemmer', size: dash.teamUpTo20 },
            { label: 'Over 20 medlemmer', size: dash.teamOver20 }
          ]} radius={150}
        />
      </Block>

      <Block width='100%' marginTop={theme.sizing.scale400}>
        <Pie title='Roller i team'
          data={dash.roles
            .map(r => ({ label: intl[r.role], size: r.count }))
            .sort(((a, b) => b.size - a.size))
          } radius={150} />
      </Block>
    </Block>
  )
}

interface PieData {
  label: string,
  size: number
}

interface PieDataExpanded extends PieData {
  color: string
  sizeFraction: number
  start: number
}

interface PieProps {
  title: string
  data: PieData[]
  radius: number
}

const Pie = (props: PieProps) => {
  const { radius, data, title } = props
  const totSize = data.map(d => d.size).reduce((a, b) => a + b, 0)

  const colors = [
    '#f44336',
    '#e91e63',
    '#9c27b0',
    '#673ab7',
    '#3f51b5',
    '#2196f3',
    '#03a9f4',
    '#00bcd4',
    '#009688',
    '#4caf50',
    '#8bc34a',
    '#cddc39',
    '#ffeb3b',
    '#ffc107',
    '#ff9800',
    '#ff5722',
    '#795548',
  ]
  let s = 0
  const expData: PieDataExpanded[] = data.map((d, idx) => {
    let pieData = { ...d, color: colors[idx % colors.length], start: s, sizeFraction: d.size / totSize }
    s += pieData.sizeFraction
    return pieData
  })

  return <PieViz data={expData} radius={radius} title={title} />
}

const PieViz = (props: { data: PieDataExpanded[], radius: number, title: string }) => {
  const { radius, data, title } = props
  const [hover, setHover] = useState<number>()
  return (
    <div onMouseLeave={() => setHover(undefined)}>
      <Block display='flex' alignItems='center'>
        <Block>
          <svg height={radius * 2.2} width={radius * 2.2}>
            <circle r={radius} cx={radius * 1.1} cy={radius * 1.1} fill={hover != undefined && hover >= 0 ? data[hover].color : 'transparent'} />
            {data.map((d, idx) =>
              <Wedge key={idx} radius={radius} size={d.sizeFraction} start={d.start} color={d.color}
                onMouseOver={() => setHover(idx)} hover={idx === hover}
              />
            )}
          </svg>
        </Block>
        <Block marginLeft={theme.sizing.scale750}>
          <Label1 marginBottom={theme.sizing.scale400}>{title}</Label1>
          {data.map((d, idx) =>
            <div key={idx} onMouseOver={() => setHover(idx)}>
              <Block backgroundColor={idx === hover ? theme.colors.accent50 : theme.colors.white} $style={{ cursor: 'default' }} display='flex'>
                <FontAwesomeIcon icon={faCircle} color={d.color} />
                <Block width={theme.sizing.scale1400} display='flex' justifyContent='flex-end'>{d.size}</Block>
                <Block width={theme.sizing.scale1400} display='flex' justifyContent='flex-end'>({(d.sizeFraction * 100).toFixed(0)}%)</Block>
                <Block marginLeft={theme.sizing.scale400}>{d.label}</Block>
              </Block>
            </div>
          )}
        </Block>
      </Block>
    </div>
  )
}

const Wedge = (props: { radius: number, size: number, start: number, color: string, hover: boolean, onMouseOver: () => void }) => {
  const { radius, size, start, color, hover } = props
  return <circle r={radius / 2} cx={radius * 1.1} cy={radius * 1.1} fill='transparent'
    stroke={color}
    strokeWidth={hover ? radius * 1.05 : radius}
    strokeDasharray={`${size * radius * 3.142} ${radius * 3.142}`}
    transform={`rotate(${-90 + start * 360} ${radius * 1.1} ${radius * 1.1})`}
    onMouseOver={props.onMouseOver}
  />
}