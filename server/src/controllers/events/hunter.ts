import { StateEvent, Target, DayTimeingEvent } from "../event";
import Witch from "./witch";
import { State } from "../../models/player";
enum eN {
  hunterKill = "HUNTER_KILL",
  hunterInfo = "HUNTER_INFO",
}

class HunterInfo extends DayTimeingEvent {
  constructor() {
    super({
      name: eN.hunterInfo,
      accessRole: ["hunter"],
      timeOut: 1,
    });
  }
  isWitchKill(day: number, initiatorId: number) {
    return this.world.statuses.getStatuses({
      eventName: Witch.eN.witchKill,
      day,
      targetId: initiatorId,
    });
  }

  targets({ initiatorId, day }: { initiatorId: number; day: number }) {
    const canKill = !this.isWitchKill(day, initiatorId);
    return [
      {
        initiatorsId: [],
        eventName: this.name,
        targetId: null,
        value: canKill,
      },
    ];
  }
}

class HunterKill extends StateEvent {
  constructor() {
    super({
      name: eN.hunterKill,
      accessRole: ["hunter"],
      accessStates: [State.Die],
    });
  }

  get isFinish() {
    return true;
  }

  targets({ initiatorId, day }: { initiatorId: number; day: number }) {
    const targets: Target[] = [];

    const initiator = this.world.players.get(initiatorId);
    if (!initiator && this.hasIdPermission({ initiatorId })) {
      return [];
    }

    const action = this.lastAction(day);

    if (!action) {
      return [];
    }

    this.world.players.forEach((player) => {
      const { isDie, id } = player;

      if (!isDie) {
        const initiatorsId = [];

        if (id === action.targetId) {
          initiatorsId.push(action.initiatorId);
        }

        targets.push({
          initiatorsId,
          eventName: this.name,
          targetId: id,
          value: null,
        });
      }
    });

    return targets;
  }
}

const statusEvent = [new HunterKill()];
const dayEvent = [new HunterInfo()];

export default { statusEvent, eN, HunterKill,dayEvent };
