<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Organization;
use App\Models\Event;
use App\Models\PassType;
use App\Models\Pass;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Super Admin user
        $superAdmin = User::create([
            'username' => 'admin',
            'email' => 'admin@gatepassx.com',
            'password' => Hash::make('password123'),
            'role' => 'super_admin',
        ]);

        // Create an organization
        $organization = Organization::create([
            'name' => 'Tech Conference 2026',
            'metadata' => ['description' => 'Annual tech conference'],
            'created_by' => $superAdmin->id,
        ]);

        // Create Organizer user
        $organizer = User::create([
            'username' => 'organizer1',
            'email' => 'organizer@techconf.com',
            'password' => Hash::make('password123'),
            'role' => 'organizer',
            'organization_id' => $organization->id,
        ]);

        // Create Gate Operators
        $gateman1 = User::create([
            'username' => 'gateman1',
            'email' => 'gate1@techconf.com',
            'password' => Hash::make('password123'),
            'role' => 'gateman',
        ]);

        $gateman2 = User::create([
            'username' => 'gateman2',
            'email' => 'gate2@techconf.com',
            'password' => Hash::make('password123'),
            'role' => 'gateman',
        ]);

        // Create an event
        $event = Event::create([
            'organization_id' => $organization->id,
            'name' => 'Tech Summit 2026',
            'date' => now()->addDays(30),
            'location' => 'Convention Center, New York',
            'event_secret' => Str::random(32),
            'status' => 'active',
            'created_by' => $organizer->id,
        ]);

        // Create pass types
        $passTypes = [
            ['name' => 'VIP', 'entry_limit' => 100],
            ['name' => 'Guest', 'entry_limit' => 500],
            ['name' => 'Staff', 'entry_limit' => 50],
            ['name' => 'Speaker', 'entry_limit' => 20],
        ];

        foreach ($passTypes as $passType) {
            PassType::create([
                'event_id' => $event->id,
                'name' => $passType['name'],
                'entry_limit' => $passType['entry_limit'],
                'access_zones' => ['Main Hall', 'VIP Lounge'],
            ]);
        }

        // Create sample passes
        $vipPassType = PassType::where('event_id', $event->id)->where('name', 'VIP')->first();
        for ($i = 0; $i < 5; $i++) {
            $passUid = Str::random(16);
            $signature = hash_hmac('sha256', $passUid, $event->event_secret);

            Pass::create([
                'event_id' => $event->id,
                'pass_type_id' => $vipPassType->id,
                'pass_uid' => $passUid,
                'signature' => $signature,
                'attendee_name' => "VIP Guest $i",
                'company' => "Tech Company $i",
                'scan_count' => 0,
                'status' => 'active',
            ]);
        }

        $this->command->info('Database seeded with test data!');
    }
}
