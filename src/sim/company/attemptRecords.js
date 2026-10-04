// Starting records are detached from live tactical state and never updated.
export function recordAttemptStart(state, choices = null) {
 const {events,replay,attempt_records,attempt_history,...start}=state;
 const record={schema:1,mission_run_id:state.mission_instance_id,
  attempt_id:`${state.mission_instance_id}:attempt:${state.attempt_number}`,
  number:state.attempt_number,choices:structuredClone(choices),starting_state:structuredClone(start)};
 state.attempt_records??=[];
 state.attempt_records.push(record);
}
