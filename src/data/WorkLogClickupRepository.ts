import _ from "lodash";
import { Day } from "../domain/Day";
import { Time } from "../domain/Time";
import { WorkLog } from "../domain/WorkLog";
import { Async } from "../domain/entities";
import { WorkLogRepository } from "../domain/repositories";
import { ClickupApi } from "./ClickupApi";
import { FutureData, TaskToSave } from "./ClickupApi.types";

type WorklogResponse = { url: string };

type ClickupReferences = {
    listId: string;
};

export class WorkLogClickupRepository implements WorkLogRepository {
    constructor(private api: ClickupApi, private references: ClickupReferences) {}

    get(options: { from: Day; to: Day }): Async<WorkLog[]> {
        // Not implemented yet, as we only need to save worklogs, not read them
        return this.api.getTasks({ listId: this.references.listId }).map(tasks => {
            return _(tasks)
                .map(task => {
                    const day = Day.fromString(task.name, "DD/MM/YYYY");
                    if (!day.isBetween(options.from, options.to)) {
                        return;
                    }

                    const getField = (pattern: string) =>
                        task.custom_fields.find(field => field.name.includes(pattern))?.value || "";

                    return WorkLog.create({
                        day: Day.fromString(task.name, "DD/MM/YYYY"),
                        userId: task.assignees[0]?.toString() || "",
                        userLegalId: getField("NIF"),
                        startTime: Time.fromString(getField("Hora Entrada 1")),
                        endTime: Time.fromString(getField("Hora Salida 1")),
                        signature: getField("Firma manual"),
                    });
                })
                .compact()
                .value();
        });
    }

    save(worklog: WorkLog): FutureData<WorklogResponse> {
        const { api } = this;
        const totalHours = worklog.totalHours;

        const task: TaskToSave = {
            name: worklog.day.format("DD/MM/YYYY"),
            text_content: "",
            description: "",
            status: "listo para revisión",
            assignees: [parseInt(worklog.userId)],
            parent: null,
            list: { id: this.references.listId },
            custom_fields: [
                {
                    id: "45e62ff3-0858-402e-b72a-cef0848ed3f1",
                    name: "01.- Empresa",
                    type: "short_text",
                    value: "EyeSeeTea Sociedad Limitada",
                    required: false,
                },
                {
                    id: "e96255aa-df31-4aaf-bf94-b4182c935210",
                    name: "02.- CIF",
                    type: "short_text",
                    value: "B23807167",
                    required: false,
                },
                {
                    id: "dffe8fa4-6bc5-4621-a992-ce70f6ab103e",
                    name: "03.- CCC",
                    type: "short_text",
                    value: "23126181339",
                    required: false,
                },
                {
                    id: "06ee1cd8-63b8-4bb5-b3da-ff4c54a02ad9",
                    name: "04- NIF",
                    type: "short_text",
                    value: worklog.userLegalId,
                    required: false,
                },
                {
                    id: "63f546cf-32df-41ec-816d-a321c225dae4",
                    name: "05.- NAF",
                    type: "short_text",
                    value: "081056130915",
                    required: false,
                },
                {
                    id: "a3f20426-9e8c-4cf8-99ba-265928a8ec8c",
                    name: "06.- Hora Entrada 1 (HH:MM)",
                    type: "short_text",
                    value: worklog.startTime.asString(),
                    required: true,
                },
                {
                    id: "d3a2bb5d-8bee-4293-8988-59390cb50a06",
                    name: "07.- Hora Salida 1 (HH:MM)",
                    type: "short_text",
                    value: worklog.endTime.asString(),
                    required: true,
                },
                {
                    id: "aee288b6-19b5-461b-9bf3-9513bf61e0d8",
                    name: "08.- Hora Entrada 2 (HH:MM)",
                    type: "short_text",
                    value: "",
                    required: false,
                },
                {
                    id: "944122bf-3102-4c95-a480-949f857845c6",
                    name: "09.- Hora Salida 2 (HH:MM)",
                    type: "short_text",
                    value: "",
                    required: false,
                },
                {
                    id: "52e8fac3-b2ef-4094-b7c2-392698ad9b24",
                    name: "10.- Total Ordinarias (HH:MM)",
                    type: "short_text",
                    value: totalHours.asString(),
                    required: true,
                },
                {
                    id: "7130e533-ee87-4eb3-b655-affb46d5975b",
                    name: "11.- Total Extraordinarias",
                    type: "short_text",
                    value: "0",
                    required: false,
                },
                {
                    id: "58b44f3b-c11e-4071-b7c7-6a15f955bb35",
                    name: "12.- Observaciones",
                    type: "text",
                    value: "",
                    required: false,
                },
                {
                    id: "6478fb54-b117-4e30-9ec7-2859a110e3c0",
                    name: "Fecha",
                    type: "date",
                    value: worklog.day.msFromEpoch().toString(),
                    required: true,
                },
                {
                    id: "465f4d8d-c017-4e99-a825-803e1cf80970",
                    name: "Firma manual",
                    type: "signature",
                    value: worklog.signature,
                    value_options: { isTyped: true, signedBy: parseInt(worklog.userId) },
                    required: false,
                },
            ],
        };

        return api.saveTask(task).map(savedTask => {
            return { url: savedTask.url };
        });
    }
}
