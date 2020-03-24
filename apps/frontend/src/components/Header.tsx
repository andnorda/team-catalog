import * as React from 'react'
import { useEffect, useState } from 'react'
import { ALIGN, HeaderNavigation, StyledNavigationItem as NavigationItem, StyledNavigationList as NavigationList, } from 'baseui/header-navigation'
import { Block, BlockProps } from 'baseui/block'
import { Button } from 'baseui/button'
import { StatefulPopover } from 'baseui/popover'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import MainSearch from './MainSearch'
import { user } from '../services/User'
import { StyledLink } from 'baseui/link'
import { env } from '../util/env'
import { useAwait } from '../util/hooks'
import { paddingAll } from './Style'
import { theme } from '../util'
import { Label2 } from 'baseui/typography'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'


const LoginButton = (props: { location: string }) => {
  return (
    <StyledLink href={`${env.teamCatalogBaseUrl}/login?redirect_uri=${props.location}`}>
      <Button $style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
        Logg inn
      </Button>
    </StyledLink>
  )
}

const LoggedInHeader = (props: { location: string }) => {
  const blockStyle: BlockProps = {
    display: 'flex',
    width: '100%',
    ...paddingAll(theme.sizing.scale100)
  }
  return (
    <StatefulPopover
      content={
        <Block padding={theme.sizing.scale400}>
          <Label2 {...blockStyle}>Navn: {user.getName()}</Label2>
          {/* <Label2 {...blockStyle}>Grupper: {user.getGroupsHumanReadable().join(', ')}</Label2> */}
          <Block {...blockStyle}>
            <StyledLink href={`${env.teamCatalogBaseUrl}/logout?redirect_uri=${props.location}`}>
              Logg ut
            </StyledLink>
          </Block>
        </Block>
      }
    >
      <Button kind="tertiary" startEnhancer={() => <FontAwesomeIcon icon={faUser} />}>{user.getIdent()}</Button>
    </StatefulPopover>
  )
}


const Header = (props: RouteComponentProps) => {
  const [url, setUrl] = useState(window.location.href)

  useAwait(user.wait())

  useEffect(() => setUrl(window.location.href), [props.location.pathname])

  return (
    <Block>
      <HeaderNavigation overrides={{ Root: { style: { paddingBottom: 0, borderBottomStyle: 'none' } } }}>
        <NavigationList $align={ALIGN.left}>
          <NavigationItem $style={{ paddingLeft: 0 }}>
            <MainSearch />
          </NavigationItem>
        </NavigationList>

        <NavigationList $align={ALIGN.center} />

        <NavigationList $align={ALIGN.right}>

          {!user.isLoggedIn() && (
            <NavigationItem $style={{ paddingLeft: 0 }}>
              <LoginButton location={url} />
            </NavigationItem>
          )}
          {user.isLoggedIn() && (
            <NavigationItem $style={{ paddingLeft: 0 }}>
              <LoggedInHeader location={url} />
            </NavigationItem>
          )}
        </NavigationList>
      </HeaderNavigation>
    </Block>
  )
}

export default withRouter(Header)
