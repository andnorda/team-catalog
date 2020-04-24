import {SORT_DIRECTION, SortableHeadCell, StyledBody, StyledCell, StyledHead, StyledHeadCell, StyledRow, StyledTable} from 'baseui/table'
import * as React from 'react'
import {ReactElement, ReactNode, useContext} from 'react'
import {withStyle} from 'baseui'
import {StyleObject} from 'styletron-standard'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSort, faSortDown, faSortUp} from '@fortawesome/free-solid-svg-icons'
import {Block} from 'baseui/block'
import {Label2} from 'baseui/typography'
import {TableState} from '../../util/hooks'
import {theme} from '../../util'
import {paddingAll} from '../Style'
import {intl} from '../../util/intl/intl'

// Use this for entire app, or recreate maybe, added here as I needed it for audit

type TableProps = {
  backgroundColor?: string,
  hoverColor?: string,
  emptyText: string,
  headers: ReactElement,
  children: ReactNode
}

type HeadProps<K extends keyof T, T> = {
  title?: string,
  column?: K,
  tableState?: TableState<T, K>
  $style?: StyleObject
  small?: boolean
}

type RowProps = {
  inactiveRow?: boolean,
  selectedRow?: boolean,
  infoRow?: boolean,
  children?: any
  $style?: StyleObject
}

const headerCellOverride = {
  HeadCell: {
    style: {
      borderLeft: 'none',
      borderRight: 'none',
      borderTop: 'none',
      borderBottom: 'none'
    }
  }
}

const StyledHeader = withStyle(StyledHead, {
  backgroundColor: 'transparent',
  boxShadow: 'none',
  borderBottom: `2px solid ${theme.colors.mono600}`,
  marginBottom: '.5rem'
})

const tableStyle = {
  backgroundColor: theme.colors.primary100,
  overflow: 'hidden !important',
  borderWidth: '0',
  borderTopLeftRadius: '0',
  borderTopRightRadius: '0',
  borderBottomLeftRadius: '0',
  borderBottomRightRadius: '0',
  ...paddingAll(theme.sizing.scale600)
}

const TableContext = React.createContext<Partial<TableProps>>({})

export const Table = (props: TableProps) => {
  const StyleTable = withStyle(StyledTable, {...tableStyle, backgroundColor: props.backgroundColor || tableStyle.backgroundColor})
  return (
    <TableContext.Provider value={props}>
      <StyleTable>
        <StyledHeader>
          {props.headers}
        </StyledHeader>
        <StyledBody>
          {props.children}
          {(!props.children || (Array.isArray(props.children) && !props.children.length))
          && <Label2 margin="1rem">{intl.emptyTable} {props.emptyText}</Label2>}
        </StyledBody>
      </StyleTable>
    </TableContext.Provider>
  )
}
export const Row = (props: RowProps) => {
  const tableProps = useContext(TableContext)
  const styleProps: StyleObject = {
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: theme.colors.mono600,
    opacity: props.inactiveRow ? '.5' : undefined,
    backgroundColor: props.infoRow ? theme.colors.primary50 : undefined,
    borderLeftColor: theme.colors.primary200,
    borderLeftWidth: props.infoRow || props.selectedRow ? theme.sizing.scale300 : '0',
    borderLeftStyle: 'solid',
    ':hover': {
      backgroundColor: tableProps.hoverColor || (props.infoRow ? theme.colors.mono100 : theme.colors.primary50)
    },
    ...props.$style
  }
  const StyleRow = withStyle(StyledRow, styleProps)
  return <StyleRow>{props.children}</StyleRow>
}

const SortDirectionIcon = (props: { direction: SORT_DIRECTION | null }) => {
  switch (props?.direction) {
    case SORT_DIRECTION.ASC:
      return <FontAwesomeIcon icon={faSortDown}/>
    case SORT_DIRECTION.DESC:
      return <FontAwesomeIcon icon={faSortUp}/>
    default:
      return <FontAwesomeIcon icon={faSort}/>
  }
}

const PlainHeadCell = withStyle(StyledHeadCell, headerCellOverride.HeadCell.style)

export const HeadCell = <T, K extends keyof T>(props: HeadProps<K, T>) => {
  const {title, tableState, column, small} = props

  const widthStyle = small ? {maxWidth: '15%'} : {}
  const styleOverride = {...widthStyle, ...props.$style}
  if (!tableState || !column) {
    return (
      <PlainHeadCell style={styleOverride}>
        {title}
      </PlainHeadCell>
    )
  }

  const [table, sortColumn] = tableState

  return (
    <SortableHeadCell
      overrides={{
        SortableLabel: {
          component: () => <span>
            <SortDirectionIcon direction={table.direction[column!]}/>
            <Block marginRight={theme.sizing.scale200} display='inline'/>
            {title}
          </span>
        },
        HeadCell: {style: {...headerCellOverride.HeadCell.style, ...styleOverride}}
      }}
      title={title || ''}
      direction={table.direction[column]}
      onSort={() => sortColumn(column!)}
      fillClickTarget
    />
  )
}

export const Cell = (props: {
  small?: boolean,
  $style?: StyleObject,
  children?: ReactNode
}) => {
  const widthStyle = props.small ? {maxWidth: '15%'} : {}
  return (
    <StyledCell style={
      {...props.$style, ...widthStyle}
    }>
      {props.children}
    </StyledCell>
  )
}