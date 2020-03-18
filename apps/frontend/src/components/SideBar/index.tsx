import * as React from 'react'
import {theme} from '../../util'
import {Block, BlockProps} from 'baseui/block'
import {H6, Paragraph4} from 'baseui/typography'
import NavLogo from '../../resources/navlogo.svg'
import {StyledLink} from 'baseui/link'
import NavItem from './NavItem'

const sideBarProps: BlockProps = {
  position: 'fixed',
  height: '100%',
  width: '240px',
  backgroundColor: theme.colors.primaryA,
}

const items: BlockProps = {
  marginLeft: '1rem',
  paddingLeft: '1rem'
}

const Brand = () => (
    <Block display="flex" flexDirection={"column"} padding="1rem" marginTop="1rem">
      <StyledLink style={{textDecoration: 'none', textAlign: 'center'}} href="/">
        <H6 color="white" marginTop="1rem" marginLeft="5px" marginBottom="2rem">Teamkatalog</H6>
      </StyledLink>
    </Block>
)

const SideBar = () => {
  return (
    <Block {...sideBarProps}>
      <Brand/>
      <Block {...items}>
        <NavItem to="/productarea" text="Produktområder" />
        <NavItem to="/" text="Teams" />
      </Block>
    </Block>
  )
}

export default SideBar