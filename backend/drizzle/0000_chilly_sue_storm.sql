CREATE TABLE `firmware_version` (
	`id` int AUTO_INCREMENT NOT NULL,
	`version_tag` varchar(50) NOT NULL,
	`github_url` varchar(500) NOT NULL,
	`release_notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `firmware_version_id` PRIMARY KEY(`id`),
	CONSTRAINT `firmware_version_version_tag_unique` UNIQUE(`version_tag`)
);
--> statement-breakpoint
CREATE TABLE `maintenance_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticket_id` int NOT NULL,
	`action_taken` text NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `maintenance_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `maintenance_ticket` (
	`id` int AUTO_INCREMENT NOT NULL,
	`station_id` varchar(36) NOT NULL,
	`engineer_id` varchar(36),
	`status` enum('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
	`description` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `maintenance_ticket_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `raw_sensor_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`station_id_raw` varchar(255),
	`pm25` int,
	`humidity` int,
	`temperature` int,
	`raw_payload` json,
	`status` enum('pending','processed','failed') NOT NULL DEFAULT 'pending',
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `raw_sensor_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `station` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`location` varchar(255),
	`api_key` varchar(255) NOT NULL,
	`mac_address` varchar(17),
	`firmware_version` varchar(50),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `station_id` PRIMARY KEY(`id`),
	CONSTRAINT `station_api_key_unique` UNIQUE(`api_key`),
	CONSTRAINT `station_mac_address_unique` UNIQUE(`mac_address`)
);
--> statement-breakpoint
CREATE TABLE `telemetry_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`station_id` varchar(36),
	`pm25` int,
	`humidity` int,
	`temperature` int,
	`is_valid` boolean DEFAULT true,
	`recorded_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `telemetry_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`username` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`role` enum('admin','engineer','user','non-login') NOT NULL DEFAULT 'non-login',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
ALTER TABLE `maintenance_log` ADD CONSTRAINT `maintenance_log_ticket_id_maintenance_ticket_id_fk` FOREIGN KEY (`ticket_id`) REFERENCES `maintenance_ticket`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `maintenance_ticket` ADD CONSTRAINT `maintenance_ticket_station_id_station_id_fk` FOREIGN KEY (`station_id`) REFERENCES `station`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `maintenance_ticket` ADD CONSTRAINT `maintenance_ticket_engineer_id_users_id_fk` FOREIGN KEY (`engineer_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `telemetry_data` ADD CONSTRAINT `telemetry_data_station_id_station_id_fk` FOREIGN KEY (`station_id`) REFERENCES `station`(`id`) ON DELETE no action ON UPDATE no action;