<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Services\TaskService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    protected TaskService $taskService;

    public function __construct(TaskService $taskService)
    {
        $this->taskService = $taskService;
    }

    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|string|in:completed,pending',
            'search' => 'sometimes|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            if ($request->has('search')) {
                $tasks = $this->taskService->searchTasks($request->search);
            } elseif ($request->has('status')) {
                if ($request->status === 'completed') {
                    $tasks = $this->taskService->getCompletedTasks();
                } else {
                    $tasks = $this->taskService->getPendingTasks();
                }
            } else {
                $tasks = $this->taskService->getAllTasks();
            }

            return response()->json([
                'success' => true,
                'message' => 'Tasks retrieved successfully',
                'data' => [
                    'tasks' => $tasks
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve tasks',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'sometimes|string',
            'due_date' => 'sometimes|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $task = $this->taskService->createTask($validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Task created successfully',
                'data' => [
                    'task' => $task
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create task',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $task = $this->taskService->findTaskById($id);

            if (!$task) {
                return response()->json([
                    'success' => false,
                    'message' => 'Task not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Task retrieved successfully',
                'data' => [
                    'task' => $task
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve task',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'due_date' => 'sometimes|date',
            'is_completed' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $task = $this->taskService->findTaskById($id);

            if (!$task) {
                return response()->json([
                    'success' => false,
                    'message' => 'Task not found'
                ], 404);
            }

            $updatedTask = $this->taskService->updateTask($id, $validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Task updated successfully',
                'data' => [
                    'task' => $updatedTask
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update task',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $task = $this->taskService->findTaskById($id);

            if (!$task) {
                return response()->json([
                    'success' => false,
                    'message' => 'Task not found'
                ], 404);
            }

            $this->taskService->deleteTask($id);

            return response()->json([
                'success' => true,
                'message' => 'Task deleted successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete task',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function toggle(int $id): JsonResponse
    {
        try {
            $task = $this->taskService->findTaskById($id);

            if (!$task) {
                return response()->json([
                    'success' => false,
                    'message' => 'Task not found'
                ], 404);
            }

            $updatedTask = $this->taskService->toggleTaskCompletion($id);

            return response()->json([
                'success' => true,
                'message' => 'Task status updated successfully',
                'data' => [
                    'task' => $updatedTask
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle task status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
