import React from 'react';
import { TeacherAssignments } from './TeacherAssignments';

export function TeacherAssignmentsPanel(){
  return <section className="ops"><div className="ops-head"><div><span className="eyebrow">ACADEMIC STAFF</span><h2>Teacher assignments</h2><p>Assign teachers to classes and subjects.</p></div></div><TeacherAssignments/></section>;
}
