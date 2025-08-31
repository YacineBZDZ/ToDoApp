<?php

namespace App\Services;

use App\Models\Task;
use Illuminate\Database\Eloquent\Collection;

class TaskService
{
    public function createTask(array $data, int $userId): Task
    {
        $data['is_completed'] = false;
        $data['user_id'] = $userId;
        
        return Task::create($data);
    }

    public function updateTask(int $id, array $data, int $userId): Task
    {
        $task = Task::where('id', $id)
                   ->where('user_id', $userId)
                   ->firstOrFail();
        $task->update($data);
        return $task->fresh();
    }

    public function deleteTask(int $id, int $userId): bool
    {
        $task = Task::where('id', $id)
                   ->where('user_id', $userId)
                   ->firstOrFail();
        return $task->delete();
    }

    public function getAllTasks(int $userId): Collection
    {
        return Task::where('user_id', $userId)
                  ->orderBy('created_at', 'desc')
                  ->get();
    }

    public function findTaskById(int $id, int $userId): ?Task
    {
        return Task::where('id', $id)
                  ->where('user_id', $userId)
                  ->first();
    }

    public function toggleTaskCompletion(int $id, int $userId): Task
    {
        $task = Task::where('id', $id)
                   ->where('user_id', $userId)
                   ->firstOrFail();
        
        if ($task->is_completed) {
            $task->markAsIncomplete();
        } else {
            $task->markAsCompleted();
        }
        
        return $task->fresh();
    }

    public function getCompletedTasks(int $userId): Collection
    {
        return Task::where('user_id', $userId)
                  ->completed()
                  ->orderBy('updated_at', 'desc')
                  ->get();
    }

    public function getPendingTasks(int $userId): Collection
    {
        return Task::where('user_id', $userId)
                  ->pending()
                  ->orderBy('created_at', 'desc')
                  ->get();
    }

    public function searchTasks(string $query, int $userId): Collection
    {
        return Task::where('user_id', $userId)
                  ->search($query)
                  ->orderBy('created_at', 'desc')
                  ->get();
    }
}
