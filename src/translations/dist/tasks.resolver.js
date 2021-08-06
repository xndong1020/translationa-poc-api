"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.TasksResolver = void 0;
var graphql_1 = require("@nestjs/graphql");
var task_entity_1 = require("./entities/task.entity");
var CreateNewTaskResponse_1 = require("./dtos/CreateNewTaskResponse");
var common_1 = require("@nestjs/common");
var auth_guard_1 = require("src/auth/auth.guard");
var USER_ROLE_enum_1 = require("src/common/enums/USER_ROLE.enum");
var TranslationTaskResponse_1 = require("./dtos/TranslationTaskResponse");
var UpdateTranslationLanguageResponse_1 = require("./dtos/UpdateTranslationLanguageResponse");
var pub_sub_module_1 = require("src/pub-sub/pub-sub.module");
var constants_1 = require("src/common/constants/constants");
var LockTaskResponse_1 = require("./dtos/LockTaskResponse");
var TasksResolver = /** @class */ (function () {
    function TasksResolver(taskService, configService, pubSub) {
        this.taskService = taskService;
        this.configService = configService;
        this.pubSub = pubSub;
    }
    TasksResolver.prototype.getTasks = function (context) {
        return __awaiter(this, void 0, Promise, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        user = context.user;
                        if (!(user.role === USER_ROLE_enum_1.UserRole.Translator)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.taskService.getMyTasks(user)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [4 /*yield*/, this.taskService.getAll()];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    TasksResolver.prototype.getMyTaskLanguage = function (taskId, context) {
        return __awaiter(this, void 0, Promise, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        user = context.user;
                        return [4 /*yield*/, this.taskService.getMyTaskLanguage(taskId, user)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    TasksResolver.prototype.getTranslationLanguage = function (input, context) {
        return __awaiter(this, void 0, Promise, function () {
            var user, tasks;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        user = context.user;
                        return [4 /*yield*/, this.taskService.getTranslationTasks(input, user)];
                    case 1:
                        tasks = _a.sent();
                        return [2 /*return*/, tasks];
                }
            });
        });
    };
    TasksResolver.prototype.createTask = function (createTaskDto) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.taskService.create(createTaskDto)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    TasksResolver.prototype.createNewTask = function (createNewTaskDto, context) {
        return __awaiter(this, void 0, Promise, function () {
            var user, _a, ok, error, newTaskCreated;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        user = context.user;
                        return [4 /*yield*/, this.taskService.createNewTask(createNewTaskDto, user)];
                    case 1:
                        _a = _b.sent(), ok = _a[0], error = _a[1], newTaskCreated = _a[2];
                        if (ok && newTaskCreated) {
                            this.pubSub.publish(constants_1.SERVER_EVENT, {
                                messageFeed: {
                                    functionName: 'createNewTask',
                                    payload: JSON.stringify(newTaskCreated)
                                }
                            });
                        }
                        return [2 /*return*/, { ok: ok, error: error }];
                }
            });
        });
    };
    TasksResolver.prototype.updateTranslationLanguage = function (updateTranslationLanguageInput) {
        return __awaiter(this, void 0, Promise, function () {
            var _a, ok, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.taskService.updateTranslationLanguage(updateTranslationLanguageInput)];
                    case 1:
                        _a = _b.sent(), ok = _a[0], error = _a[1];
                        return [2 /*return*/, { ok: ok, error: error }];
                }
            });
        });
    };
    TasksResolver.prototype.lockTask = function (taskId, context) {
        return __awaiter(this, void 0, Promise, function () {
            var user, _a, ok, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        user = context.user;
                        if (!(user.role !== USER_ROLE_enum_1.UserRole.Translator)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.taskService.lockTask(taskId, user.email)];
                    case 1:
                        _a = _b.sent(), ok = _a[0], error = _a[1];
                        if (ok) {
                            this.pubSub.publish(constants_1.SERVER_EVENT, {
                                messageFeed: {
                                    functionName: 'lockTask',
                                    payload: JSON.stringify({ taskId: taskId })
                                }
                            });
                        }
                        return [2 /*return*/, { ok: ok, error: error }];
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    __decorate([
        graphql_1.Query(function () { return [task_entity_1.Task]; }, { nullable: true }),
        common_1.UseGuards(auth_guard_1.AuthGuard),
        __param(0, graphql_1.Context())
    ], TasksResolver.prototype, "getTasks");
    __decorate([
        graphql_1.Query(function () { return String; }, { nullable: true }),
        common_1.UseGuards(auth_guard_1.AuthGuard),
        __param(0, graphql_1.Args('taskId')),
        __param(1, graphql_1.Context())
    ], TasksResolver.prototype, "getMyTaskLanguage");
    __decorate([
        graphql_1.Query(function () { return [TranslationTaskResponse_1.TranslationTaskResponse]; }, { nullable: true }),
        common_1.UseGuards(auth_guard_1.AuthGuard),
        __param(0, graphql_1.Args('input')),
        __param(1, graphql_1.Context())
    ], TasksResolver.prototype, "getTranslationLanguage");
    __decorate([
        graphql_1.Mutation(function () { return graphql_1.Int; }, { nullable: true }),
        __param(0, graphql_1.Args('createTaskDto'))
    ], TasksResolver.prototype, "createTask");
    __decorate([
        graphql_1.Mutation(function () { return CreateNewTaskResponse_1.CreateNewTaskResponse; }),
        __param(0, graphql_1.Args('createNewTaskDto')),
        __param(1, graphql_1.Context())
    ], TasksResolver.prototype, "createNewTask");
    __decorate([
        graphql_1.Mutation(function () { return UpdateTranslationLanguageResponse_1.UpdateTranslationLanguageResponse; }),
        __param(0, graphql_1.Args('updateTranslationLanguageInput'))
    ], TasksResolver.prototype, "updateTranslationLanguage");
    __decorate([
        graphql_1.Mutation(function () { return LockTaskResponse_1.LockTaskResponse; }),
        __param(0, graphql_1.Args('taskId')),
        __param(1, graphql_1.Context())
    ], TasksResolver.prototype, "lockTask");
    TasksResolver = __decorate([
        graphql_1.Resolver(),
        __param(2, common_1.Inject(pub_sub_module_1.PUB_SUB))
    ], TasksResolver);
    return TasksResolver;
}());
exports.TasksResolver = TasksResolver;
