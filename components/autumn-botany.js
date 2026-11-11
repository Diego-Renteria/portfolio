export const AUTUMN_HABITS=[
 {species:'broad maple',height:1.05,width:1.16,crown:.75},
 {species:'silver birch',height:1.30,width:.69,crown:1.28},
 {species:'serviceberry',height:.74,width:.88,crown:.90},
 {species:'golden ginkgo',height:1.12,width:.91,crown:1.10},
 {species:'red maple',height:.92,width:1.04,crown:.87}
];
export function autumnHabit(index,random,size=1,nearFocus=false){
 const habit=AUTUMN_HABITS[index%AUTUMN_HABITS.length];
 const age=.72+random()*.56,scale=size*age;
 return{...habit,scale,height:Math.min(nearFocus?1.12:1.65,habit.height*scale),width:Math.min(nearFocus?1.12:1.65,habit.width*scale)};
}
