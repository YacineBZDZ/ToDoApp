<?php

namespace App\Services;

use App\Models\Task;
use Illuminate\Database\Eloquent\Collection;

class TaskService
{
    public function createTask(array $data): Task
    {
        $data['is_completed'] = false;
        
        return Task::create($data);
    }

    public function updateTask(int $id, array $data): Task
    {
        $task = Task::findOrFail($id);
        $task->update($data);
        return $task->fresh();
    }

    public function deleteTask(int $id): bool
    {
        $task = Task::findOrFail($id);
        return $task->delete();
    }

    public function getAllTasks(): Collection
    {
        return Task::orderBy('created_at', 'desc')->get();
    }

    public function findTaskById(int $id): ?Task
    {
        return Task::find($id);
    }

    public function toggleTaskCompletion(int $id): Task
    {
        $task = Task::findOrFail($id);
        
        if ($task->is_completed) {
            $task->markAsIncomplete();
        } else {
            $task->markAsCompleted();
        }
        
        return $task->fresh();
    }

    public function getCompletedTasks(): Collection
    {
        return Task::completed()
            ->orderBy('updated_at', 'desc')
            ->get();
    }

    public function getPendingTasks(): Collection
    {
        return Task::pending()
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function searchTasks(string $query): Collection
    {
        return Task::search($query)
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
