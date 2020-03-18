package no.nav.data.team.team;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.common.exceptions.ValidationException;
import no.nav.data.team.common.rest.RestResponsePage;
import no.nav.data.team.common.utils.StreamUtils;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.dto.TeamRequest;
import no.nav.data.team.team.dto.TeamResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Objects;
import java.util.UUID;
import javax.validation.Valid;

@Slf4j
@RestController
@RequestMapping("/team")
@Api(value = "Team endpoint", tags = "Team")
public class TeamController {

    private final TeamService service;

    public TeamController(TeamService service) {
        this.service = service;
    }

    @ApiOperation("Get All Teams")
    @ApiResponses({
            @ApiResponse(code = 200, message = "ok", response = TeamPageResponse.class)
    })
    @GetMapping
    public ResponseEntity<RestResponsePage<TeamResponse>> getAll() {
        log.info("Get all Teams");
        return ResponseEntity.ok(new RestResponsePage<>(StreamUtils.convert(service.getAll(), Team::convertToResponse)));
    }

    @ApiOperation("Get Team")
    @ApiResponses({
            @ApiResponse(code = 200, message = "ok", response = TeamResponse.class),
            @ApiResponse(code = 404, message = "not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<TeamResponse> getById(@PathVariable UUID id) {
        log.info("Get Team id={}", id);
        return ResponseEntity.ok(service.get(id).convertToResponse());
    }

    @ApiOperation(value = "Create Team")
    @ApiResponses(value = {
            @ApiResponse(code = 201, message = "Team created", response = TeamResponse.class),
            @ApiResponse(code = 400, message = "Illegal arguments"),
    })
    @PostMapping
    public ResponseEntity<TeamResponse> createTeam(@RequestBody TeamRequest request) {
        log.info("Create Team");
        var team = service.save(request);
        return new ResponseEntity<>(team.convertToResponse(), HttpStatus.CREATED);
    }

    @ApiOperation(value = "Update Team", notes = "If members is null members will not be updated")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Team updated", response = TeamResponse.class),
            @ApiResponse(code = 400, message = "Illegal arguments"),
            @ApiResponse(code = 404, message = "Team not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<TeamResponse> updateTeam(@PathVariable UUID id, @Valid @RequestBody TeamRequest request) {
        log.debug("Update Team id={}", id);
        if (!Objects.equals(id, request.getIdAsUUID())) {
            throw new ValidationException(String.format("id mismatch in request %s and path %s", request.getId(), id));
        }
        var team = service.save(request);
        return ResponseEntity.ok(team.convertToResponse());
    }

    @ApiOperation(value = "Delete Team")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Team deleted", response = TeamResponse.class),
            @ApiResponse(code = 404, message = "Team not found"),
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<TeamResponse> deleteTeamById(@PathVariable UUID id) {
        log.info("Delete Team id={}", id);
        var team = service.delete(id);
        return ResponseEntity.ok(team.convertToResponse());
    }

    static class TeamPageResponse extends RestResponsePage<TeamResponse> {

    }

}