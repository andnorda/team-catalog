package no.nav.data.team.ressurs.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Resource {

    private String navIdent;
    private String givenName;
    private String familyName;
    private String email;
    private ResourceType resourceType;
}