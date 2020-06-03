package no.nav.data.team.common.security;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.util.Set;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class SecurityConstants {

    public static final String COOKIE_NAME = "teamsession";
    // UUID hex without dashes
    public static final int SESS_ID_LEN = 32;
    public static final String TOKEN_TYPE = "Bearer ";

}
